import { atom, computed } from 'nanostores';
import { toast } from 'sonner';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('tradelogix_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.accessToken) {
        return { Authorization: `Bearer ${user.accessToken}` };
      }
    }
  } catch (e) {}
  return {};
};

// Helper to resolve the correct unit price for a given quantity based on wholesale tiers
export const calculateTierUnitPrice = (item, quantity) => {
  if (!item) return 0;
  const rawBase = item.basePrice !== undefined && item.basePrice !== null
    ? item.basePrice
    : (item.pricing?.basePrice !== undefined ? item.pricing.basePrice : item.price);
  const basePrice = parseFloat(rawBase) || 0;
  const tiers = item.tiers || item.pricing?.tiers || [];
  if (Array.isArray(tiers) && tiers.length > 0) {
    const sorted = [...tiers].sort((a, b) => Number(b.minQuantity) - Number(a.minQuantity));
    const matched = sorted.find((t) => Number(quantity) >= Number(t.minQuantity));
    if (matched && matched.price !== undefined && matched.price !== null) {
      return parseFloat(matched.price);
    }
  }
  return basePrice;
};

// Initial cart state from localStorage if client side
const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tradelogix_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            const rawBase = item.basePrice !== undefined && item.basePrice !== null
              ? item.basePrice
              : (item.pricing?.basePrice !== undefined ? item.pricing.basePrice : item.price);
            const basePrice = parseFloat(rawBase) || 0;
            const itemWithBase = { ...item, basePrice };
            const correctPrice = calculateTierUnitPrice(itemWithBase, item.quantity);
            return { ...itemWithBase, price: correctPrice };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load cart state', e);
    }
  }
  return [];
};

export const cartItems = atom(getInitialCart());
export const isCartOpen = atom(false);
export const cartNotification = atom(null);

// Save to local storage on change
if (typeof window !== 'undefined') {
  cartItems.subscribe((items) => {
    try {
      localStorage.setItem('tradelogix_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  });
}

// Automatically enrich cart items that might have missing tiers in localStorage
export const enrichCartItemsWithTiers = async () => {
  if (typeof window === 'undefined') return;
  const currentItems = cartItems.get();
  if (!Array.isArray(currentItems) || currentItems.length === 0) return;

  const itemsNeedingTiers = currentItems.filter((i) => !i.tiers || i.tiers.length === 0);
  if (itemsNeedingTiers.length === 0) {
    // Check if any prices mismatch their tier quantities
    let anyPriceMismatch = false;
    const verified = currentItems.map((item) => {
      const expectedPrice = calculateTierUnitPrice(item, item.quantity);
      if (expectedPrice !== item.price) {
        anyPriceMismatch = true;
        return { ...item, price: expectedPrice };
      }
      return item;
    });
    if (anyPriceMismatch) {
      cartItems.set(verified);
    }
    return;
  }

  let hasUpdates = false;
  const updated = [...cartItems.get()];
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };

  await Promise.all(
    itemsNeedingTiers.map(async (item) => {
      try {
        const identifier = item.slug || item.id;
        if (!identifier) return;
        const res = await fetch(`${API_URL}/api/shop/products/${identifier}`, { headers });
        if (!res.ok) return;
        const json = await res.json();
        const p = json.data || json;
        const tiers = p.pricing?.tiers || p.tiers || [];
        const rawBase = p.pricing?.basePrice ? parseFloat(p.pricing.basePrice) : (parseFloat(p.price) || item.price);

        const idx = updated.findIndex((i) => String(i.id) === String(item.id) && i.variant === item.variant);
        if (idx > -1 && Array.isArray(tiers) && tiers.length > 0) {
          updated[idx] = {
            ...updated[idx],
            tiers,
            basePrice: updated[idx].basePrice || rawBase,
            pricing: p.pricing || updated[idx].pricing,
          };
          updated[idx].price = calculateTierUnitPrice(updated[idx], updated[idx].quantity);
          hasUpdates = true;
        }
      } catch (e) {
        // network or offline
      }
    })
  );

  if (hasUpdates) {
    cartItems.set(updated);
  }
};

if (typeof window !== 'undefined') {
  setTimeout(() => {
    enrichCartItemsWithTiers();
  }, 100);
}

// Computed total count of items in cart
export const cartItemCount = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
});

// Computed subtotal cost
export const cartSubtotal = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Helper to resolve available stock for a product or cart item
export const getAvailableStock = (product) => {
  if (!product) return 0;
  if (product.inStock === false) return 0;
  if (typeof product.stockCount === 'number') return Math.max(0, product.stockCount);
  if (typeof product.stock === 'number') return Math.max(0, product.stock);
  if (typeof product.totalStock === 'number') return Math.max(0, product.totalStock);
  if (typeof product.stockCount === 'string' && !isNaN(parseInt(product.stockCount, 10))) {
    return Math.max(0, parseInt(product.stockCount, 10));
  }
  if (typeof product.stock === 'string' && !isNaN(parseInt(product.stock, 10))) {
    return Math.max(0, parseInt(product.stock, 10));
  }
  return product.inStock !== false ? 9999 : 0;
};

// Add item to cart with strict inventory/stock limit checks
export const addToCart = (product, quantity = 1, selectedVariant = null) => {
  const variantVal = selectedVariant || product.variant || product.variants?.[0] || 'Default';
  const currentItems = cartItems.get();
  
  const existingIndex = currentItems.findIndex(
    (item) => String(item.id) === String(product.id) && item.variant === variantVal
  );

  const maxStock = getAvailableStock(product);

  // Out of stock guard
  if (maxStock <= 0) {
    toast.error(`"${product.name}" is currently out of stock.`);
    cartNotification.set(`"${product.name}" is currently out of stock.`);
    setTimeout(() => cartNotification.set(null), 3500);
    return false;
  }

  const fallbackImage = '/placeholder-product.svg';
  const img = product.featuredImage || product.image || (product.images && product.images[0]) || fallbackImage;
  const rawBase = product.basePrice !== undefined && product.basePrice !== null
    ? product.basePrice
    : (product.pricing?.basePrice !== undefined ? product.pricing.basePrice : product.price);
  const basePrice = parseFloat(rawBase) || 0;
  const tiers = (product.tiers && product.tiers.length > 0)
    ? product.tiers
    : (product.pricing?.tiers || []);

  if (existingIndex > -1) {
    const updated = [...currentItems];
    const currentQty = updated[existingIndex].quantity;
    const remainingAllowed = Math.max(0, maxStock - currentQty);

    if (remainingAllowed <= 0) {
      toast.warning(`Cannot add more. All ${maxStock} available unit(s) of "${product.name}" are already in your cart.`);
      cartNotification.set(`Cannot add more. All ${maxStock} available unit(s) of "${product.name}" are already in your cart.`);
      setTimeout(() => cartNotification.set(null), 3500);
      isCartOpen.set(true);
      return false;
    }

    const addQty = Math.min(quantity, remainingAllowed);
    const newQty = currentQty + addQty;
    updated[existingIndex].quantity = newQty;
    updated[existingIndex].stockCount = maxStock;
    
    const existingTiers = (tiers && tiers.length > 0)
      ? tiers
      : (updated[existingIndex].tiers && updated[existingIndex].tiers.length > 0 ? updated[existingIndex].tiers : []);
    const existingBasePrice = updated[existingIndex].basePrice !== undefined && updated[existingIndex].basePrice !== null
      ? parseFloat(updated[existingIndex].basePrice)
      : (basePrice || parseFloat(updated[existingIndex].price) || 0);

    updated[existingIndex].tiers = existingTiers;
    updated[existingIndex].basePrice = existingBasePrice;

    // Auto-recalculate unit price for the merged quantity
    const newUnitPrice = calculateTierUnitPrice(
      {
        basePrice: existingBasePrice,
        tiers: existingTiers,
        price: updated[existingIndex].price,
      },
      newQty
    );
    updated[existingIndex].price = newUnitPrice;
    if (!updated[existingIndex].image || updated[existingIndex].image === fallbackImage) {
      updated[existingIndex].image = img;
    }
    cartItems.set(updated);

    if (quantity > remainingAllowed) {
      toast.warning(`Added ${addQty} unit(s). Maximum available stock (${maxStock}) reached.`);
    } else {
      toast.success(`Added "${product.name}" to your cart.`);
    }
  } else {
    const finalQty = Math.min(quantity, maxStock);
    const initialUnitPrice = calculateTierUnitPrice({ basePrice, tiers, price: product.price }, finalQty);
    cartItems.set([
      ...currentItems,
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice,
        price: initialUnitPrice,
        tiers,
        pricing: product.pricing || null,
        image: img,
        featuredImage: img,
        category: product.category,
        variant: variantVal,
        quantity: finalQty,
        stockCount: maxStock,
      },
    ]);

    if (quantity > maxStock) {
      toast.warning(`Added ${finalQty} unit(s) of "${product.name}". Only ${maxStock} unit(s) in stock.`);
    } else {
      toast.success(`Added "${product.name}" to your cart.`);
    }
  }

  // Automatically open cart drawer
  isCartOpen.set(true);
  return true;
};

// Update item quantity with strict stock limit enforcement
export const updateQuantity = (id, variant, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(id, variant);
    return;
  }
  const currentItems = cartItems.get();
  const targetItem = currentItems.find((item) => String(item.id) === String(id) && item.variant === variant);
  if (!targetItem) return;

  const maxStock = getAvailableStock(targetItem);
  let effectiveQty = newQuantity;

  if (effectiveQty > maxStock) {
    effectiveQty = maxStock;
    toast.warning(`Maximum available stock (${maxStock}) reached for "${targetItem.name}".`);
    cartNotification.set(`Maximum available stock (${maxStock}) reached for "${targetItem.name}".`);
    setTimeout(() => {
      cartNotification.set(null);
    }, 3500);
  }

  const updated = currentItems.map((item) => {
    if (String(item.id) === String(id) && item.variant === variant) {
      const newUnitPrice = calculateTierUnitPrice(item, effectiveQty);
      return { ...item, quantity: effectiveQty, price: newUnitPrice, stockCount: maxStock };
    }
    return item;
  });
  cartItems.set(updated);

  // If item lacks tiers, fetch them in background and update price
  if (!targetItem.tiers || targetItem.tiers.length === 0) {
    const identifier = targetItem.slug || targetItem.id;
    if (identifier && typeof window !== 'undefined') {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      fetch(`${API_URL}/api/shop/products/${identifier}`, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!json) return;
          const p = json.data || json;
          const tiers = p.pricing?.tiers || p.tiers || [];
          if (Array.isArray(tiers) && tiers.length > 0) {
            const latestItems = cartItems.get();
            const reUpdated = latestItems.map((it) => {
              if (String(it.id) === String(id) && it.variant === variant) {
                const basePrice = it.basePrice || (p.pricing?.basePrice ? parseFloat(p.pricing.basePrice) : (parseFloat(p.price) || it.price));
                const itemWithTiers = { ...it, tiers, basePrice, pricing: p.pricing || it.pricing };
                const updatedPrice = calculateTierUnitPrice(itemWithTiers, it.quantity);
                return { ...itemWithTiers, price: updatedPrice };
              }
              return it;
            });
            cartItems.set(reUpdated);
          }
        })
        .catch(() => {});
    }
  }
};

// Remove item from cart
export const removeFromCart = (id, variant) => {
  const currentItems = cartItems.get();
  const targetItem = currentItems.find((item) => String(item.id) === String(id) && item.variant === variant);
  const updated = currentItems.filter(
    (item) => !(String(item.id) === String(id) && item.variant === variant)
  );
  cartItems.set(updated);
  if (targetItem) {
    toast.info(`Removed "${targetItem.name}" from cart.`);
  }
};

// Clear all items from cart
export const clearCart = () => {
  cartItems.set([]);
};

// Toggle cart drawer visibility
export const toggleCart = (openState) => {
  if (typeof openState === 'boolean') {
    isCartOpen.set(openState);
  } else {
    isCartOpen.set(!isCartOpen.get());
  }
};

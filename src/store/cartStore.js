import { atom, computed } from 'nanostores';
import { toast } from 'sonner';

// Initial cart state from localStorage if client side
const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tradelogix_cart');
      return saved ? JSON.parse(saved) : [];
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

// Helper to resolve the correct unit price for a given quantity based on wholesale tiers
export const calculateTierUnitPrice = (item, quantity) => {
  const basePrice = item.basePrice ? parseFloat(item.basePrice) : (item.price || 0);
  const tiers = item.tiers || item.pricing?.tiers || [];
  if (Array.isArray(tiers) && tiers.length > 0) {
    const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matched = sorted.find((t) => quantity >= t.minQuantity);
    if (matched) {
      return parseFloat(matched.price);
    }
  }
  return basePrice;
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

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  const img = product.featuredImage || product.image || (product.images && product.images[0]) || fallbackImage;
  const basePrice = product.pricing?.basePrice ? parseFloat(product.pricing.basePrice) : (product.price || 0);
  const tiers = product.pricing?.tiers || product.tiers || [];

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
    
    const existingTiers = (updated[existingIndex].tiers && updated[existingIndex].tiers.length > 0)
      ? updated[existingIndex].tiers
      : tiers;
    const existingBasePrice = updated[existingIndex].basePrice || basePrice || updated[existingIndex].price;

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

import { atom, computed } from 'nanostores';

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

// Add item to cart (merges identical product + variant, automatically updates quantity & tier price)
export const addToCart = (product, quantity = 1, selectedVariant = null) => {
  const variantVal = selectedVariant || product.variant || product.variants?.[0] || 'Default';
  const currentItems = cartItems.get();
  
  const existingIndex = currentItems.findIndex(
    (item) => String(item.id) === String(product.id) && item.variant === variantVal
  );

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  const img = product.featuredImage || product.image || (product.images && product.images[0]) || fallbackImage;
  const basePrice = product.pricing?.basePrice ? parseFloat(product.pricing.basePrice) : (product.price || 0);
  const tiers = product.pricing?.tiers || product.tiers || [];

  if (existingIndex > -1) {
    const updated = [...currentItems];
    const newQty = updated[existingIndex].quantity + quantity;
    updated[existingIndex].quantity = newQty;
    
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
  } else {
    const initialUnitPrice = calculateTierUnitPrice({ basePrice, tiers, price: product.price }, quantity);
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
        quantity,
      },
    ]);
  }

  // Trigger quick alert/toast notification
  cartNotification.set(`Added "${product.name}" to your cart.`);
  setTimeout(() => {
    cartNotification.set(null);
  }, 3500);

  // Automatically open cart drawer
  isCartOpen.set(true);
};

// Update item quantity
export const updateQuantity = (id, variant, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(id, variant);
    return;
  }
  const currentItems = cartItems.get();
  const updated = currentItems.map((item) => {
    if (String(item.id) === String(id) && item.variant === variant) {
      const newUnitPrice = calculateTierUnitPrice(item, newQuantity);
      return { ...item, quantity: newQuantity, price: newUnitPrice };
    }
    return item;
  });
  cartItems.set(updated);
};

// Remove item from cart
export const removeFromCart = (id, variant) => {
  const currentItems = cartItems.get();
  const updated = currentItems.filter(
    (item) => !(String(item.id) === String(id) && item.variant === variant)
  );
  cartItems.set(updated);
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

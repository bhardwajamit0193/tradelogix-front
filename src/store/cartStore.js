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
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
});

// Add item to cart
export const addToCart = (product, quantity = 1, selectedVariant = null) => {
  const currentItems = cartItems.get();
  const existingIndex = currentItems.findIndex(
    (item) => item.id === product.id && item.variant === selectedVariant
  );

  if (existingIndex > -1) {
    const updated = [...currentItems];
    updated[existingIndex].quantity += quantity;
    cartItems.set(updated);
  } else {
    cartItems.set([
      ...currentItems,
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        category: product.category,
        variant: selectedVariant || product.variants?.[0] || 'Default',
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
    if (item.id === id && item.variant === variant) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
  cartItems.set(updated);
};

// Remove item from cart
export const removeFromCart = (id, variant) => {
  const currentItems = cartItems.get();
  const updated = currentItems.filter(
    (item) => !(item.id === id && item.variant === variant)
  );
  cartItems.set(updated);
};

// Clear entire cart
export const clearCart = () => {
  cartItems.set([]);
};

// Toggle cart drawer
export const toggleCart = (openState) => {
  if (typeof openState === 'boolean') {
    isCartOpen.set(openState);
  } else {
    isCartOpen.set(!isCartOpen.get());
  }
};

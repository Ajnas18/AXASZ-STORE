import { create } from 'zustand';

export const useStore = create((set) => ({
  cart: [],
  wishlist: [],
  
  // Cart Actions
  addToCart: (product, size, qty = 1) => set((state) => {
    const existingItem = state.cart.find(
      (item) => item.id === product.id && item.selectedSize === size
    );
    
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + qty }
            : item
        ),
      };
    }
    
    return {
      cart: [...state.cart, { ...product, selectedSize: size, quantity: qty }],
    };
  }),
  
  removeFromCart: (productId, size) => set((state) => ({
    cart: state.cart.filter(
      (item) => !(item.id === productId && item.selectedSize === size)
    ),
  })),

  updateQuantity: (productId, size, quantity) => set((state) => {
    if (quantity <= 0) {
      return {
        cart: state.cart.filter(
          (item) => !(item.id === productId && item.selectedSize === size)
        ),
      };
    }
    return {
      cart: state.cart.map((item) =>
        item.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      ),
    };
  }),

  clearCart: () => set({ cart: [] }),

  // Wishlist Actions
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.some((item) => item.id === product.id);
    if (exists) {
      return {
        wishlist: state.wishlist.filter((item) => item.id !== product.id),
      };
    }
    return {
      wishlist: [...state.wishlist, product],
    };
  }),
}));

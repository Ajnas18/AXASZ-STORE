import { create } from 'zustand';
import { urlFor } from '../sanity/client.js';

// Helper to resolve Sanity image object to a string URL
const resolveProductImage = (product) => {
  if (!product) return '/placeholder1.jpg';
  
  if (product.image && typeof product.image !== 'string') {
    try {
      return urlFor(product.image).url();
    } catch (e) {
      console.error("Error resolving product image:", e);
    }
  }
  if (typeof product.image === 'string' && product.image) {
    return product.image;
  }

  // Fallback to first image in images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    try {
      return urlFor(product.images[0]).url();
    } catch (e) {
      console.error("Error resolving product from images array:", e);
    }
  }

  return '/placeholder1.jpg';
};

// Helper to unify product IDs (Sanity uses _id, cart code uses id)
const getProductId = (p) => p?._id || p?.id;

export const useStore = create((set) => ({
  cart: [],
  wishlist: [],
  
  // Cart Actions
  addToCart: (product, size, qty = 1, variant = null) => set((state) => {
    const productId = getProductId(product);
    const color = variant?.color || product?.selectedColor || product?.colors?.[0] || 'Default';
    const variantId = variant?.variantId || '';
    const variantImage = variant?.image ? (typeof variant.image === 'string' ? variant.image : resolveProductImage(variant)) : resolveProductImage(product);
    const itemPrice = typeof variant?.price === 'number' ? variant.price : product.price;

    const existingItem = state.cart.find(
      (item) => getProductId(item) === productId && item.selectedSize === size && (item.selectedColor || 'Default') === color
    );
    
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          getProductId(item) === productId && item.selectedSize === size && (item.selectedColor || 'Default') === color
            ? { ...item, quantity: item.quantity + qty }
            : item
        ),
      };
    }
    
    // Resolve image and ensure both id & _id and variant metadata are populated
    const processedProduct = {
      ...product,
      id: productId,
      _id: productId,
      price: itemPrice,
      image: variantImage,
      selectedSize: size,
      selectedColor: color,
      variantId: variantId,
      asin: variant?.asin || product?.productCode || '',
      quantity: qty
    };
    
    return {
      cart: [...state.cart, processedProduct],
    };
  }),
  
  removeFromCart: (productId, size, color) => set((state) => ({
    cart: state.cart.filter(
      (item) => !(
        getProductId(item) === productId && 
        item.selectedSize === size && 
        (!color || (item.selectedColor || 'Default') === color)
      )
    ),
  })),

  updateQuantity: (productId, size, quantity, color) => set((state) => {
    if (quantity <= 0) {
      return {
        cart: state.cart.filter(
          (item) => !(
            getProductId(item) === productId && 
            item.selectedSize === size && 
            (!color || (item.selectedColor || 'Default') === color)
          )
        ),
      };
    }
    return {
      cart: state.cart.map((item) =>
        getProductId(item) === productId && 
        item.selectedSize === size && 
        (!color || (item.selectedColor || 'Default') === color)
          ? { ...item, quantity }
          : item
      ),
    };
  }),

  clearCart: () => set({ cart: [] }),

  // Wishlist Actions
  toggleWishlist: (product) => set((state) => {
    const productId = getProductId(product);
    const exists = state.wishlist.some((item) => getProductId(item) === productId);
    
    if (exists) {
      return {
        wishlist: state.wishlist.filter((item) => getProductId(item) !== productId),
      };
    }
    
    const processedProduct = {
      ...product,
      id: productId,
      _id: productId,
      image: resolveProductImage(product)
    };
    
    return {
      wishlist: [...state.wishlist, processedProduct],
    };
  }),
}));

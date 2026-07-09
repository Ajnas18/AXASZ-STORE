import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Heart, Trash2, Plus, Minus } from 'lucide-react';
import styles from './SideDrawer.module.css';
import { useStore } from '@/store/useStore';
import { urlFor } from '@/sanity/client';

const getProductImageUrl = (image) => {
  if (!image) return '/logo.png';
  if (typeof image === 'string') return image;
  try {
    return urlFor(image).url();
  } catch (e) {
    console.error("Error building image URL:", e);
    return '/logo.png';
  }
};

export default function SideDrawer({ isOpen, onClose, mode }) {
  const router = useRouter();
  const { cart, wishlist, removeFromCart, updateQuantity, toggleWishlist, addToCart } = useStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCart = mode === 'cart';
  const items = isCart ? cart : wishlist;
  const isEmpty = items.length === 0;

  // Calculate cart subtotal
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isCart ? 'Shopping Cart' : 'My Wishlist'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {isCart ? <ShoppingBag size={48} /> : <Heart size={48} />}
              </div>
              <h3>{isCart ? 'Your cart is empty' : 'Your wishlist is empty'}</h3>
              <p>Looks like you haven't added anything yet.</p>
              <button className={styles.actionBtn} onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={`${item.id}-${isCart ? item.selectedSize : 'fav'}`} className={styles.itemCard}>
                  <img src={getProductImageUrl(item.image)} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <h4>{item.name}</h4>
                      <button 
                        className={styles.removeItemBtn}
                        onClick={() => isCart ? removeFromCart(item.id, item.selectedSize) : toggleWishlist(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.productCode && <p className={styles.itemSku}>SKU: {item.productCode}</p>}
                    <p className={styles.itemBrand}>{item.brand}</p>
                    <p className={styles.itemPrice}>₹{item.price.toFixed(2)}</p>
                    
                    {isCart ? (
                      <div className={styles.cartControls}>
                        <div className={styles.sizeInfo}>Size: {item.selectedSize}</div>
                        <div className={styles.quantityControls}>
                          <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}><Minus size={14}/></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}><Plus size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className={styles.addToCartBtn} 
                        onClick={() => {
                          addToCart(item, 9); // Default size 9 for quick add from wishlist
                          toggleWishlist(item);
                        }}
                      >
                        Move to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isCart && !isEmpty && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button 
              className={styles.checkoutBtn}
              onClick={() => {
                onClose();
                router.push('/checkout');
              }}
            >
              Order Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}

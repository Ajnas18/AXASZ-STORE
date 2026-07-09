"use client";

import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { urlFor } from '@/sanity/client';
import styles from './ProductCard.module.css';

import { useStore } from '@/store/useStore';

export default function ProductCard({ product, onClick }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  
  const isWishlisted = wishlist.some((item) => item._id === product._id || item.id === product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || 9); // default to first size
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div 
      className={styles.card}
      onClick={() => onClick && onClick(product)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover="hover"
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.imageContainer}>
        {product.badge && (
          <div className={styles.badge}>{product.badge}</div>
        )}
        <button 
          className={styles.wishlistBtn} 
          onClick={handleToggleWishlist}
          style={{ color: isWishlisted ? 'red' : 'inherit' }}
        >
          <Heart size={18} fill={isWishlisted ? 'red' : 'none'} />
        </button>
        <motion.img 
          src={
            product.image 
              ? urlFor(product.image).url() 
              : (product.images && product.images.length > 0 
                  ? urlFor(product.images[0]).url() 
                  : '/placeholder1.jpg')
          } 
          alt={product.name} 
          className={styles.image}
          variants={{
            hover: { scale: 1.08, rotate: -2, transition: { duration: 0.5, ease: "easeOut" } }
          }}
        />
        
        <motion.div 
          className={styles.quickActions}
          variants={{
            hover: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
          }}
          initial={{ y: 20, opacity: 0 }}
        >
          <button className={styles.actionBtn}>
            <Eye size={16} /> Quick View
          </button>
          <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handleAddToCart}>
            <ShoppingBag size={16} /> Add to Cart
          </button>
        </motion.div>
      </div>

      <div className={styles.details}>
        <div className={styles.brandRating}>
          <span className={styles.brand}>{product.brand}</span>
          <div className={styles.rating}>
            <Star size={12} fill="#1A1A1A" color="#1A1A1A" />
            <span>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews})</span>
          </div>
        </div>

        <h3 className={styles.name}>{product.name}</h3>
        {product.productCode && (
          <div className={styles.productCode}>SKU: {product.productCode}</div>
        )}

        <div className={styles.priceContainer}>
          <span className={styles.price}>₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice}</span>
          )}
        </div>

        <div className={styles.metaInfo}>
          <div className={styles.sizes}>
            <span className={styles.metaLabel}>Sizes:</span>
            {product.sizes?.slice(0, 3).join(", ") || 'N/A'}
            {product.sizes?.length > 3 && " +"}
          </div>
          <div className={styles.colors}>
            <span className={styles.metaLabel}>Colors:</span>
            {product.colors?.length || 0}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

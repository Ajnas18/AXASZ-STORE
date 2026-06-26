"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, Heart, ShoppingBag, Truck, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import styles from './ProductDetails.module.css';

// Helper to get hex colors from name
const getColorHex = (name) => {
  const n = name.toLowerCase();
  if (n.includes('black')) return '#111111';
  if (n.includes('white')) return '#f0f0f0';
  if (n.includes('red')) return '#ef4444';
  if (n.includes('blue')) return '#3b82f6';
  if (n.includes('green') || n.includes('volt')) return '#22c55e';
  if (n.includes('navy')) return '#1e3a8a';
  if (n.includes('grey') || n.includes('shadow')) return '#9ca3af';
  if (n.includes('rust') || n.includes('lava')) return '#ea580c';
  if (n.includes('chicago') || n.includes('bred')) return '#dc2626';
  if (n.includes('parchment') || n.includes('salt')) return '#f5f5dc';
  return '#e5e7eb'; // default grey
};

export default function ProductDetails({ product }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setQuantity(1);
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) return null;

  // Mock Gallery Images (just duplicating the main image for demo)
  const galleryImages = [product.image, product.image, product.image];

  return (
    <motion.div 
      className={styles.detailsContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* LEFT COLUMN: INFO */}
      <div className={styles.leftColumn}>
        <div className={styles.brandLogo}>{product.brand}</div>
        <h1 className={styles.productName}>{product.name}</h1>
        
        <div className={styles.priceRatingRow}>
          <div className={styles.price}>₹{product.price.toLocaleString()}</div>
          <div className={styles.rating}>
            <Star size={18} fill="#fbbf24" className={styles.starIcon} />
            <span>{product.rating} ({product.reviews} Reviews)</span>
          </div>
        </div>

        <p className={styles.description}>
          Experience the perfect blend of style and comfort with the {product.name}. 
          Engineered for all-day wear, featuring premium materials and advanced cushioning technology 
          to keep you moving effortlessly.
        </p>

        <div>
          <h3 className={styles.sectionTitle}>Select Size (UK)</h3>
          <div className={styles.sizesGrid}>
            {product.sizes.map(size => (
              <button 
                key={size}
                className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSizeBtn : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>Select Color - {selectedColor}</h3>
          <div className={styles.colorsFlex}>
            {product.colors.map(color => (
              <div 
                key={color}
                className={`${styles.colorSwatch} ${selectedColor === color ? styles.activeColorSwatch : ''}`}
                style={{ backgroundColor: getColorHex(color) }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>Quantity</h3>
          <div className={styles.quantityRow}>
            <div className={styles.qtySelector}>
              <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16}/></button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}><Plus size={16}/></button>
            </div>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.addToCartBtn}>
            <ShoppingBag size={20} /> Add to Cart
          </button>
          <button className={styles.buyNowBtn}>
            Buy Now
          </button>
          <button className={styles.wishlistBtn}>
            <Heart size={20} /> Add to Wishlist
          </button>
        </div>

        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <CheckCircle2 size={18} color="#22c55e" /> In Stock & Ready to Ship
          </div>
          <div className={styles.infoItem}>
            <Truck size={18} /> Free Delivery all over India
          </div>
          <div className={styles.infoItem}>
            <ArrowLeftRight size={18} /> Free 30-Day Returns
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: IMAGES & SPECS */}
      <div className={styles.rightColumn}>
        <div>
          <div className={styles.imagePreview}>
            <img src={activeImage} alt={product.name} className={styles.mainImage} />
          </div>
          <div className={styles.gallery}>
            {galleryImages.map((img, i) => (
              <div 
                key={i} 
                className={`${styles.thumbnail} ${activeImage === img ? styles.activeThumbnail : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`Gallery ${i}`} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.specsSection}>
          <h2 className={styles.sectionTitle}>Specifications</h2>
          <div className={styles.specsGrid}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Brand</span>
              <span className={styles.specValue}>{product.brand}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Model</span>
              <span className={styles.specValue}>{product.name}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Category</span>
              <span className={styles.specValue}>Lifestyle / Premium</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Material</span>
              <span className={styles.specValue}>Premium Leather / Mesh</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Sole</span>
              <span className={styles.specValue}>Durable Rubber</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Weight</span>
              <span className={styles.specValue}>~ 350g</span>
            </div>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <CheckCircle2 className={styles.featureIcon} /> Lightweight Design
            </div>
            <div className={styles.featureCard}>
              <CheckCircle2 className={styles.featureIcon} /> Breathable Materials
            </div>
            <div className={styles.featureCard}>
              <CheckCircle2 className={styles.featureIcon} /> Cushioned Comfort
            </div>
            <div className={styles.featureCard}>
              <CheckCircle2 className={styles.featureIcon} /> High Durability
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

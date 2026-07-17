"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, Heart, ShoppingBag, Truck, ArrowLeftRight, CheckCircle2, Camera } from 'lucide-react';
import styles from './ProductDetails.module.css';
import { useStore } from '@/store/useStore';
import { urlFor } from '@/sanity/client';
import Link from 'next/link';

// Helper to get hex colors from name
const getColorHex = (name) => {
  const n = name.toLowerCase();
  if (n.includes('black')) return '#1A1A1A';
  if (n.includes('white')) return '#E5E5E5';
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

const getProductGallery = (product) => {
  if (!product) return ['/placeholder1.jpg'];
  const gallery = [];

  // 1. Add cover image first if it exists
  if (product.image) {
    try {
      const coverUrl = urlFor(product.image).url();
      if (coverUrl) {
        gallery.push(coverUrl);
      }
    } catch (e) {
      console.error("Error resolving cover image:", e);
    }
  }

  // 2. Add all images from the images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach(img => {
      try {
        if (img) {
          const url = urlFor(img).url();
          if (url && !gallery.includes(url)) {
            gallery.push(url);
          }
        }
      } catch (e) {
        console.error("Error resolving gallery image:", e);
      }
    });
  }

  // 3. Add model wearing image if present
  if (product.modelImage) {
    try {
      const modelUrl = urlFor(product.modelImage).url();
      if (modelUrl && !gallery.includes(modelUrl)) {
        gallery.push(modelUrl);
      }
    } catch (e) {
      console.error("Error resolving model image:", e);
    }
  }

  // Fallback if gallery is empty
  if (gallery.length === 0) {
    gallery.push('/placeholder1.jpg');
  }

  return gallery;
};

export default function ProductDetails({ product }) {
  const router = useRouter();
  const initialGallery = getProductGallery(product);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(initialGallery[0]);
  
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.some((item) => item._id === product?._id || item.id === product?.id);

  const handleBuyNow = () => {
    const sizeToBuy = selectedSize || product?.sizes?.[0] || 9;
    addToCart(product, sizeToBuy, quantity);
    router.push('/checkout');
  };

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0]);
      setSelectedColor(product.colors?.[0]);
      setQuantity(1);
      const newGallery = getProductGallery(product);
      setActiveImage(newGallery[0]);
    }
  }, [product]);

  if (!product) return null;

  const galleryImages = getProductGallery(product);

  // Calculate savings
  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;

  return (
    <>
      <motion.div 
        className={styles.detailsContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* LEFT COLUMN: INFO */}
        <div className={styles.leftColumn}>
          {/* Badge Row */}
          <div className={styles.badgeRow}>
            <span className={styles.brandBadge}>{product.brand}</span>
            <span className={styles.stockBadge}>
              <CheckCircle2 size={11} /> In Stock
            </span>
            <span className={styles.codBadge}>COD not available</span>
          </div>

          <h1 className={styles.productName}>{product.name}</h1>
          
          <div className={styles.priceRatingRow}>
            <div>
              <div className={styles.priceBlock}>
                <span className={styles.price}>₹{product.price.toLocaleString()}</span>
                {savings && (
                  <span className={styles.mrpPrice}>₹{product.originalPrice.toLocaleString()}</span>
                )}
                {savings && (
                  <span className={styles.savingsTag}>Save ₹{savings.toLocaleString()}</span>
                )}
              </div>
            </div>
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
            <h3 className={styles.sectionTitle}>Choose Color: {selectedColor || 'N/A'}</h3>
            {/* Text-pill color buttons (like reference design) */}
            <div className={styles.colorPillsFlex}>
              {product.colors?.map(color => (
                <button
                  key={color}
                  className={`${styles.colorPill} ${selectedColor === color ? styles.activeColorPill : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
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

          {/* Desktop action buttons — hidden on mobile (replaced by sticky bar) */}
          <div className={styles.actionButtons}>
            <button className={styles.addToCartBtn} onClick={() => addToCart(product, selectedSize, quantity)}>
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>
              Buy Now
            </button>
            <Link href={`/try/${product._id}`} style={{ width: '100%', textDecoration: 'none' }}>
              <button className={styles.tryBtn}>
                <Camera size={20} /> View on Model
              </button>
            </Link>
            <button 
              className={styles.wishlistBtn} 
              onClick={() => toggleWishlist(product)}
              style={{ color: isWishlisted ? 'red' : 'inherit' }}
            >
              <Heart size={20} fill={isWishlisted ? 'red' : 'none'} /> Add to Wishlist
            </button>
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <CheckCircle2 size={18} color="#22c55e" /> In Stock &amp; Ready to Ship
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

      {/* ── STICKY MOBILE BOTTOM BAR ── */}
      <div className={styles.stickyBottomBar}>
        <div className={styles.stickyTopRow}>
          {/* Quantity Selector */}
          <div className={styles.stickyQtySelector}>
            <button
              className={styles.stickyQtyBtn}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >−</button>
            <span className={styles.stickyQtyValue}>{quantity}</span>
            <button
              className={styles.stickyQtyBtn}
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>

          {/* Add to Cart */}
          <button
            className={styles.stickyAddToCartBtn}
            onClick={() => addToCart(product, selectedSize, quantity)}
          >
            <ShoppingBag size={16} /> Add to Cart
          </button>

          {/* Wishlist */}
          <button
            className={styles.stickyWishlistBtn}
            onClick={() => toggleWishlist(product)}
          >
            <Heart
              size={18}
              fill={isWishlisted ? 'red' : 'none'}
              color={isWishlisted ? 'red' : '#1A1A1A'}
            />
          </button>
        </div>

        {/* Buy Now */}
        <button
          className={styles.stickyBuyNowBtn}
          onClick={handleBuyNow}
        >
          Buy Now
        </button>
      </div>
    </>
  );
}


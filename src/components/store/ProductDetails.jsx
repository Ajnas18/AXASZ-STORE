"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Plus, 
  Minus, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ArrowLeftRight, 
  CheckCircle2, 
  Camera, 
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import styles from './ProductDetails.module.css';
import { useStore } from '@/store/useStore';
import { normalizeProductVariants, findVariant } from '@/lib/productVariants';
import Link from 'next/link';
import ShareModal from '@/components/ui/ShareModal';

export default function ProductDetails({ product }) {
  const router = useRouter();
  
  // Normalize all color variants with guaranteed isolated galleries
  const variants = useMemo(() => {
    return normalizeProductVariants(product);
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.variantId || '');
  
  // Current active variant strictly controls the gallery and variant-specific data
  const selectedVariant = useMemo(() => {
    return findVariant(variants, selectedVariantId) || variants[0] || null;
  }, [variants, selectedVariantId]);

  const currentGallery = useMemo(() => {
    return selectedVariant?.gallery || ['/placeholder1.jpg'];
  }, [selectedVariant]);

  const [activeImage, setActiveImage] = useState(currentGallery[0]);
  const [selectedSize, setSelectedSize] = useState(selectedVariant?.sizes?.[0] || 9);
  const [quantity, setQuantity] = useState(1);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.some((item) => item._id === product?._id || item.id === product?.id);

  // Initialize and sync variant from URL params if present
  useEffect(() => {
    if (typeof window !== 'undefined' && variants.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const colorParam = params.get('color') || params.get('variant') || params.get('sku');
      if (colorParam) {
        const matched = findVariant(variants, colorParam);
        if (matched) {
          setSelectedVariantId(matched.variantId);
          setActiveImage(matched.gallery?.[0] || matched.image || '/placeholder1.jpg');
          if (matched.sizes?.length > 0) {
            setSelectedSize(matched.sizes[0]);
          }
          return;
        }
      }
      
      const firstVar = variants[0];
      setSelectedVariantId(firstVar.variantId);
      setActiveImage(firstVar.gallery[0]);
      setSelectedSize(firstVar.sizes?.[0] || product?.sizes?.[0] || 9);
      setQuantity(1);
    }
  }, [product, variants]);

  // Handle color variant switch - strictly resets gallery to 1st image of selected variant and updates URL
  const handleSelectVariant = useCallback((variant) => {
    if (!variant || variant.variantId === selectedVariantId) return;

    setSelectedVariantId(variant.variantId);
    
    // 1. Immediately switch gallery and reset to first image of the newly chosen color
    const newGallery = variant.gallery && variant.gallery.length > 0 ? variant.gallery : ['/placeholder1.jpg'];
    setActiveImage(newGallery[0]);

    // 2. Preserve selected size if available in the new variant, otherwise fallback to first available
    if (Array.isArray(variant.sizes) && variant.sizes.length > 0) {
      if (!variant.sizes.includes(selectedSize)) {
        setSelectedSize(variant.sizes[0]);
      }
    }

    // 3. Update URL query params without reloading
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('color', variant.color);
      window.history.replaceState(null, '', url.toString());
    }
  }, [selectedVariantId, selectedSize]);

  // Gallery Navigation (Prev / Next)
  const currentImageIndex = currentGallery.indexOf(activeImage);
  const safeIndex = currentImageIndex >= 0 ? currentImageIndex : 0;

  const handlePrevImage = useCallback((e) => {
    e?.stopPropagation();
    const prevIndex = (safeIndex - 1 + currentGallery.length) % currentGallery.length;
    setActiveImage(currentGallery[prevIndex]);
  }, [safeIndex, currentGallery]);

  const handleNextImage = useCallback((e) => {
    e?.stopPropagation();
    const nextIndex = (safeIndex + 1) % currentGallery.length;
    setActiveImage(currentGallery[nextIndex]);
  }, [safeIndex, currentGallery]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage]);

  // Add to Cart handler with full variant payload
  const handleAddToCart = () => {
    const sizeToBuy = selectedSize || selectedVariant?.sizes?.[0] || 9;
    addToCart(product, sizeToBuy, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    const sizeToBuy = selectedSize || selectedVariant?.sizes?.[0] || 9;
    addToCart(product, sizeToBuy, quantity, selectedVariant);
    router.push('/checkout');
  };

  // Mouse move handler for luxury image zoom
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (!product || !selectedVariant) return null;

  // Active pricing calculation
  const currentPrice = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice;
  const savings = originalPrice && originalPrice > currentPrice ? originalPrice - currentPrice : null;
  const availableSizes = selectedVariant.sizes || product.sizes || [];

  return (
    <>
      <motion.div 
        className={styles.detailsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── LEFT COLUMN: PRODUCT GALLERY & SPECS (DESKTOP) ── */}
        <div className={styles.leftColumn}>
          <div className={styles.galleryWrapper}>
            {/* Main Interactive Image Preview Container */}
            <div 
              className={styles.imagePreview}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Image Counter Badge */}
              <div className={styles.imageCounterBadge}>
                {safeIndex + 1} / {currentGallery.length} • {selectedVariant.color}
              </div>

              {/* Mobile Quick Share & Wishlist in preview */}
              <div className={styles.previewQuickActions}>
                <button
                  type="button"
                  className={styles.previewActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart
                    size={17}
                    fill={isWishlisted ? '#dc2626' : 'none'}
                    color={isWishlisted ? '#dc2626' : '#111827'}
                  />
                </button>
                <button
                  type="button"
                  className={styles.previewActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareOpen(true);
                  }}
                  aria-label="Share"
                  title="Share product"
                >
                  <Share2 size={17} />
                </button>
              </div>

              {/* Navigation Arrows */}
              {currentGallery.length > 1 && (
                <>
                  <button 
                    type="button"
                    className={`${styles.navArrow} ${styles.prevArrow}`}
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    type="button"
                    className={`${styles.navArrow} ${styles.nextArrow}`}
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Main Image with Animated Transition on color or photo change */}
              <AnimatePresence mode="wait">
                <motion.img 
                  key={`${selectedVariant.variantId}-${activeImage}`}
                  src={activeImage} 
                  alt={`${product.name} - ${selectedVariant.color} view ${safeIndex + 1}`} 
                  className={styles.mainImage}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.5, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(1.45)',
                        }
                      : undefined
                  }
                />
              </AnimatePresence>
            </div>

            {/* Thumbnail Strip strictly belonging to this color variant */}
            {currentGallery.length > 1 && (
              <div className={styles.gallery} role="tablist" aria-label="Variant image thumbnails">
                {currentGallery.map((img, i) => {
                  const isActive = activeImage === img;
                  return (
                    <button 
                      key={`${selectedVariant.variantId}-thumb-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.thumbnail} ${isActive ? styles.activeThumbnail : ''}`}
                      onClick={() => setActiveImage(img)}
                      title={`View ${selectedVariant.color} angle ${i + 1}`}
                    >
                      <img src={img} alt={`${product.name} ${selectedVariant.color} thumbnail ${i + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Specifications Table (Shown under gallery on desktop, bottom on mobile) */}
          <div className={styles.specsSection}>
            <h2 className={styles.sectionTitle}>Product Specifications</h2>
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Brand</span>
                <span className={styles.specValue}>{product.brand}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Selected Color</span>
                <span className={styles.specValue}>{selectedVariant.color}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Model Name</span>
                <span className={styles.specValue}>{product.name}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>SKU / ASIN</span>
                <span className={styles.specValue}>{selectedVariant.asin || selectedVariant.variantId || product.productCode || 'N/A'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Material</span>
                <span className={styles.specValue}>Premium Leather / Breathable Mesh</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Sole Construction</span>
                <span className={styles.specValue}>High-Traction Rubber</span>
              </div>
            </div>
          </div>


        </div>

        {/* ── RIGHT COLUMN: PRODUCT INFO & PURCHASE ACTIONS (DESKTOP) ── */}
        <div className={styles.rightColumn}>
          {/* Header Row: Badges & Desktop Share/Wishlist Actions */}
          <div className={styles.topHeaderRow}>
            {product.badge ? (
              <div className={styles.badgeRow}>
                <span className={styles.specialBadge}>
                  <Sparkles size={11} /> {product.badge}
                </span>
              </div>
            ) : null}

            {/* Desktop Action Icons */}
            <div className={styles.desktopTopActions}>
              <button 
                type="button"
                className={styles.headerIconBtn} 
                onClick={() => toggleWishlist(product)}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label="Wishlist"
              >
                <Heart size={16} fill={isWishlisted ? '#dc2626' : 'none'} color={isWishlisted ? '#dc2626' : 'currentColor'} />
              </button>
              <button 
                type="button"
                className={styles.headerIconBtn} 
                onClick={() => setIsShareOpen(true)}
                title="Share Product"
                aria-label="Share"
              >
                <Share2 size={16} />
                <span className={styles.headerShareText}>Share</span>
              </button>
            </div>
          </div>

          {/* Product Name */}
          <h1 className={styles.productName}>{product.name}</h1>
          
          {/* Price & Rating */}
          <div className={styles.priceRatingRow}>
            <div className={styles.priceBlock}>
              <span className={styles.price}>₹{currentPrice.toLocaleString()}</span>
              {savings && (
                <span className={styles.mrpPrice}>₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            <div className={styles.rating}>
              <Star size={16} fill="#fbbf24" className={styles.starIcon} />
              <span>{product.rating || '4.8'} ({product.reviews || '24'} Reviews)</span>
            </div>
          </div>

          {/* Short Description */}
          <p className={styles.description}>
            Experience unmatched craftsmanship with the {product.name} in {selectedVariant.color}. 
            Engineered for style, durability, and all-day comfort with signature cushioning technology.
          </p>

          {/* ── COLOR VARIANT SELECTOR (Compact Shoe Thumbnail Cards) ── */}
          <div className={styles.variantSection}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>
                Colorway: <span className={styles.highlightedColor}>{selectedVariant.color}</span>
              </h3>
              {selectedVariant.asin && (
                <span className={styles.asinTag}>ASIN: {selectedVariant.asin}</span>
              )}
            </div>

            <div className={styles.variantCardsGrid} role="radiogroup" aria-label="Product color variants">
              {variants.map((v) => {
                const isSelected = v.variantId === selectedVariant.variantId;
                const thumbUrl = v.image || (v.gallery && v.gallery[0]) || '/placeholder1.jpg';

                return (
                  <button
                    key={v.variantId}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`${styles.variantCard} ${isSelected ? styles.activeVariantCard : ''} ${!v.inStock ? styles.outOfStockVariantCard : ''}`}
                    onClick={() => handleSelectVariant(v)}
                    title={`${v.color} - ₹${v.price.toLocaleString()}`}
                  >
                    <div className={styles.variantCardImageWrapper}>
                      <img 
                        src={thumbUrl} 
                        alt={v.color} 
                        className={styles.variantCardImage} 
                      />
                      {isSelected && (
                        <span className={styles.variantActiveBadge}>
                          <CheckCircle2 size={11} strokeWidth={2.5} />
                        </span>
                      )}
                      {!v.inStock && (
                        <span className={styles.variantOosBadge}>Out of Stock</span>
                      )}
                    </div>
                    <div className={styles.variantCardInfo}>
                      <span className={styles.variantCardColor}>{v.color}</span>
                      <span className={styles.variantCardPrice}>₹{v.price?.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SIZE SELECTOR ── */}
          <div className={styles.sizeSection}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Select Size (UK)</h3>
              <span className={styles.sizeGuideLink}>Standard UK Sizing</span>
            </div>
            <div className={styles.sizesGrid}>
              {availableSizes.map((size) => (
                <button 
                  key={size}
                  type="button"
                  className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSizeBtn : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ── QUANTITY & VIEW ON MODEL ── */}
          <div className={styles.quantityAndToolsRow}>
            <div className={styles.qtyContainer}>
              <span className={styles.qtyLabel}>Quantity:</span>
              <div className={styles.qtySelector}>
                <button 
                  type="button"
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14}/>
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button 
                  type="button"
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14}/>
                </button>
              </div>
            </div>

            <Link href={`/try/${product._id}`} className={styles.tryOnLink}>
              <Camera size={15} /> View on Model
            </Link>
          </div>

          {/* ── PRIMARY PURCHASE ACTION BUTTONS ── */}
          <div className={styles.actionButtons}>
            <button 
              type="button"
              className={styles.buyNowBtn} 
              onClick={handleBuyNow}
              disabled={!selectedVariant.inStock}
            >
              Buy Now
            </button>
            <button 
              type="button"
              className={styles.addToCartBtn} 
              onClick={handleAddToCart}
              disabled={!selectedVariant.inStock}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          {/* Value Props & Guarantees */}
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <CheckCircle2 size={16} color="#22c55e" /> 100% Authentic Guaranteed
            </div>
            <div className={styles.infoItem}>
              <Truck size={16} /> Free Express Delivery Across India
            </div>
            <div className={styles.infoItem}>
              <ArrowLeftRight size={16} /> Easy 30-Day Returns &amp; Exchanges
            </div>
            <div className={styles.infoItem}>
              <ShieldCheck size={16} color="#6366f1" /> Secure SSL Encrypted Checkout
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── RESPONSIVE MOBILE STICKY BOTTOM BAR ── */}
      <div className={styles.stickyBottomBar}>
        <div className={styles.stickyBarContent}>
          {/* Price & Size summary */}
          <div className={styles.stickyPriceInfo}>
            <span className={styles.stickyPriceText}>₹{(currentPrice * quantity).toLocaleString()}</span>
            <span className={styles.stickySizeText}>UK {selectedSize} • {selectedVariant.color}</span>
          </div>

          {/* Dual Action Buttons */}
          <div className={styles.stickyActionGroup}>
            <button
              type="button"
              className={styles.stickyAddToCartBtn}
              onClick={handleAddToCart}
              disabled={!selectedVariant.inStock}
              aria-label="Add to cart"
            >
              <ShoppingBag size={17} />
              <span>Cart</span>
            </button>

            <button
              type="button"
              className={styles.stickyBuyNowBtn}
              onClick={handleBuyNow}
              disabled={!selectedVariant.inStock}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />
    </>
  );
}

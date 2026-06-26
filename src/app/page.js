"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import ProductDetails from '@/components/store/ProductDetails';
import { PRODUCTS } from '@/data/products';
import styles from './page.module.css';

const BRANDS = ["All Brands", "Nike", "Adidas", "Puma", "New Balance", "Converse", "Vans"];
const SIZES = [6, 7, 8, 9, 10, 11];

export default function Home() {
  // Store State
  const [activeBrand, setActiveBrand] = useState("All Brands");
  const [selectedSize, setSelectedSize] = useState("All Sizes");
  const [priceRange, setPriceRange] = useState("All Prices");
  const [sortBy, setSortBy] = useState("Sort: Featured");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      document.getElementById('product-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle New Arrivals link
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#new-arrivals') {
        setSortBy("Newest");
        setTimeout(() => {
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    // Brand Filter
    if (activeBrand !== "All Brands") {
      result = result.filter(p => p.brand.toLowerCase() === activeBrand.toLowerCase());
    }

    // Size Filter
    if (selectedSize !== "All Sizes") {
      result = result.filter(p => p.sizes.includes(Number(selectedSize)));
    }

    // Price Filter
    if (priceRange === "Under ₹8,000") result = result.filter(p => p.price < 8000);
    else if (priceRange === "₹8,000 - ₹12,000") result = result.filter(p => p.price >= 8000 && p.price <= 12000);
    else if (priceRange === "₹12,000 - ₹16,000") result = result.filter(p => p.price >= 12000 && p.price <= 16000);
    else if (priceRange === "Over ₹16,000") result = result.filter(p => p.price > 16000);

    // Sorting
    switch (sortBy) {
      case "Newest":
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      case "Price: Low to High":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "Highest Rated":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break; 
    }

    return result;
  }, [activeBrand, selectedSize, priceRange, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <main className={styles.main}>
      {/* Video Hero Section */}
      <section className={styles.hero}>
        <video 
          className={styles.videoBackground}
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemFadeUp} className={styles.headline}>
              Step Into Style
            </motion.h1>
            
            <motion.p variants={itemFadeUp} className={styles.subheading}>
              Discover Premium Sneakers from the World's Leading Brands.
            </motion.p>
            
            <motion.div variants={itemFadeUp} className={styles.buttonGroup}>
              <a href="#products" className={`${styles.btn} ${styles.btnPrimary}`}>Shop Now</a>
              <a href="#brands" className={`${styles.btn} ${styles.btnSecondary}`}>Explore Brands</a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Brand Cards Section */}
      <section id="brands" className={styles.brandsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Brand</h2>
        </div>

        <div className={styles.brandCardsGrid}>
          {BRANDS.map((brand) => (
            <div 
              key={brand}
              className={`${styles.brandCard} ${activeBrand === brand ? styles.activeBrandCard : ""}`}
              onClick={() => setActiveBrand(brand)}
            >
              <span className={styles.brandCardName}>{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section id="products" className={styles.mainContent}>
        {/* Controls Bar */}
        <div className={styles.controlsBar}>
          <div className={styles.filtersGroup}>
            <div className={styles.filterDropdown}>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className={styles.selectDropdown}
              >
                <option value="All Sizes">Size: All</option>
                {SIZES.map(s => <option key={s} value={s}>Size: {s}</option>)}
              </select>
              <ChevronDown size={14} className={styles.selectIcon} />
            </div>
            
            <div className={styles.filterDropdown}>
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
                className={styles.selectDropdown}
              >
                <option value="All Prices">Price: All</option>
                <option value="Under ₹8,000">Under ₹8,000</option>
                <option value="₹8,000 - ₹12,000">₹8,000 - ₹12,000</option>
                <option value="₹12,000 - ₹16,000">₹12,000 - ₹16,000</option>
                <option value="Over ₹16,000">Over ₹16,000</option>
              </select>
              <ChevronDown size={14} className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.resultsCount}>
            Showing {filteredProducts.length} Results
          </div>

          <div className={styles.filterDropdown}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.selectDropdown}
            >
              <option>Sort: Featured</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
            <ChevronDown size={14} className={styles.selectIcon} />
          </div>
        </div>

        {/* Product Grid */}
        <div className={styles.productGrid}>
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} onClick={handleProductClick} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              No products found matching your filters.
            </div>
          )}
        </div>

        {/* Product Details Panel */}
        <AnimatePresence mode="wait">
          {selectedProduct && (
            <div id="product-details-section">
              <ProductDetails product={selectedProduct} />
            </div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import Link from 'next/link';
import { SlidersHorizontal, ChevronDown, Calendar, Users, ShieldCheck, Star, ThumbsUp, Truck, Camera, Mail, MessageCircle, Phone, MapPin, Send, Lock, Headset } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import ProductCard from '@/components/store/ProductCard';
import ProductDetails from '@/components/store/ProductDetails';
import HowToOrderSection from '@/components/store/HowToOrderSection';
import styles from './page.module.css';

const elegantFont = Playfair_Display({
  weight: '500',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
});

const BRANDS = ["All Brands", "Nike", "Adidas", "Puma", "New Balance", "Converse", "Vans"];
const SIZES = [6, 7, 8, 9, 10, 11];

const InstagramIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsappIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function HomeClient({ initialProducts = [] }) {
  // Ripple wave animation controls
  const [scope, animate] = useAnimate();
  const line1 = useMemo(() => "WALK YOUR".split(""), []);
  const line2 = useMemo(() => "STORY".split(""), []);

  const handleLetterClick = (clickedIdx) => {
    // Total indices from 0 to 14 (length of "WALK YOUR STORY")
    const totalIndices = 15;
    for (let idx = 0; idx < totalIndices; idx++) {
      if (idx === 4 || idx === 9) continue; // Skip spaces
      const isClicked = idx === clickedIdx;
      const dist = Math.abs(idx - clickedIdx);
      const delay = dist * 0.03; // 30ms delay

      animate(
        `span[data-index="${idx}"]`,
        {
          y: isClicked ? [0, -20, 2, 0] : [0, -7, 0],
          scale: isClicked ? [1, 1.35, 0.95, 1] : [1, 1.12, 1],
          color: isClicked ? ["#ffffff", "#ffffff", "#ffffff"] : ["#ffffff", "#d8d8d8", "#ffffff"],
          textShadow: isClicked
            ? [
                "0 4px 20px rgba(0,0,0,0.5)",
                "0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.8)",
                "0 4px 20px rgba(0,0,0,0.5)"
              ]
            : [
                "0 4px 20px rgba(0,0,0,0.5)",
                "0 0 15px rgba(255,255,255,0.4)",
                "0 4px 20px rgba(0,0,0,0.5)"
              ]
        },
        {
          duration: isClicked ? 0.7 : 0.45,
          delay: delay,
          ease: "easeOut"
        }
      );
    }
  };

  // Store State
  const [activeBrand, setActiveBrand] = useState("All Brands");
  const [selectedSize, setSelectedSize] = useState("All Sizes");
  const [priceRange, setPriceRange] = useState("All Prices");
  const [sortBy, setSortBy] = useState("Sort: Featured");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    setMousePos({ x, y });
  };

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, message } = contactForm;
    if (!name || !message) {
      alert('Please fill in at least your name and message.');
      return;
    }
    const text = `Hi AXASZSTORE! 💬\n\n*Name:* ${name}\n*Email:* ${email || 'N/A'}\n*Phone:* ${phone || 'N/A'}\n\n*Message:*\n${message}`;
    const waLink = `https://wa.me/918943029774?text=${encodeURIComponent(text)}`;
    window.open(waLink, '_blank');
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

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
    let result = initialProducts;

    // Brand Filter
    if (activeBrand !== "All Brands") {
      result = result.filter(p => p.brand.toLowerCase() === activeBrand.toLowerCase());
    }

    // Size Filter
    if (selectedSize !== "All Sizes") {
      result = result.filter(p => p.sizes.includes(Number(selectedSize)));
    }

    // Price Filter
    if (priceRange === "Under ₹1,000") result = result.filter(p => p.price < 1000);
    else if (priceRange === "₹1,000 - ₹2,000") result = result.filter(p => p.price >= 1000 && p.price <= 2000);
    else if (priceRange === "Over ₹2,000") result = result.filter(p => p.price > 2000);

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
      <section className={styles.hero} onMouseMove={handleMouseMove}>
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

        <div className={styles.heroContainer} style={{ justifyContent: 'flex-start' }}>
          <div className={styles.heroContent} style={{ alignItems: 'flex-start', textAlign: 'left' }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <motion.h1 
                ref={scope}
                variants={itemFadeUp} 
                className={styles.headline}
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', userSelect: 'none' }}
              >
                {/* Line 1: WALK YOUR */}
                <div style={{ display: 'block', whiteSpace: 'nowrap' }}>
                  {line1.map((char, index) => {
                    const globalIdx = index; // 0 to 8
                    if (char === ' ') {
                      return (
                        <span key={index} style={{ display: 'inline-block', width: '0.28em' }}>
                          &nbsp;
                        </span>
                      );
                    }
                    return (
                      <motion.span
                        key={index}
                        data-index={globalIdx}
                        onClick={() => handleLetterClick(globalIdx)}
                        style={{ 
                          display: 'inline-block', 
                          cursor: 'pointer',
                          transformOrigin: 'center center'
                        }}
                        whileHover={{ 
                          y: -4, 
                          scale: 1.05, 
                          transition: { duration: 0.2, ease: "easeOut" } 
                        }}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </div>

                {/* Line 2: STORY */}
                <div style={{ display: 'block', whiteSpace: 'nowrap' }}>
                  {line2.map((char, index) => {
                    const globalIdx = index + 10; // 10 to 14 (index 9 is the space between lines)
                    return (
                      <motion.span
                        key={index}
                        data-index={globalIdx}
                        onClick={() => handleLetterClick(globalIdx)}
                        style={{ 
                          display: 'inline-block', 
                          cursor: 'pointer',
                          transformOrigin: 'center center'
                        }}
                        whileHover={{ 
                          y: -4, 
                          scale: 1.05, 
                          transition: { duration: 0.2, ease: "easeOut" } 
                        }}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </div>
              </motion.h1>

              <motion.p 
                variants={itemFadeUp} 
                className={styles.subheading}
                style={{ textAlign: 'left', marginLeft: 0, marginRight: 'auto' }}
              >
                Premium Sneakers for Every Step
              </motion.p>

              <motion.div 
                variants={itemFadeUp} 
                className={styles.buttonGroup}
                style={{ justifyContent: 'flex-start' }}
              >
                <Link href="#products" className={`${styles.btn} ${styles.primaryBtn}`}>
                  Shop Now
                </Link>
                <Link href="#products" className={`${styles.btn} ${styles.secondaryBtn}`}>
                  Explore Collection
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <motion.div
            className={styles.aboutTop}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.aboutImageWrapper}>
              <img src="/logo.png" alt="AXASZ STORE Logo" className={styles.aboutLogo} />
            </div>
            <div className={styles.aboutTitleWrapper}>
              <motion.h2 
                className={styles.aboutTitleLarge}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.1
                    }
                  }
                }}
              >
                <span style={{ display: 'inline-block' }}>
                  {"WHO WE".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      style={{ display: 'inline-block' }}
                      variants={{
                        hidden: { opacity: 0, y: 35, rotateX: -30 },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          rotateX: 0, 
                          transition: { type: 'spring', damping: 10, stiffness: 100 } 
                        }
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </span>
                <br />
                <span style={{ display: 'inline-block' }}>
                  {"ARE ?".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      style={{ display: 'inline-block' }}
                      variants={{
                        hidden: { opacity: 0, y: 35, rotateX: -30 },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          rotateX: 0, 
                          transition: { type: 'spring', damping: 10, stiffness: 100 } 
                        }
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </span>
              </motion.h2>
            </div>
          </motion.div>

          <motion.div
            className={styles.aboutDivider}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          ></motion.div>

          <div className={styles.aboutBottomLayout}>
            {/* Left side: Symbols (Stats) */}
            <div className={styles.aboutSymbolsLeft}>
              <div className={styles.statsGrid}>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                  <div className={styles.iconWrapper}>
                    <Calendar size={28} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>Established in 2023</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                  <div className={styles.iconWrapper}>
                    <Users size={28} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>100+ Happy Customers</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                  <div className={styles.iconWrapper}>
                    <ShieldCheck size={24} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>100% Authentic Products</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                  <div className={styles.iconWrapper}>
                    <Star size={24} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>Premium Brands</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
                  <div className={styles.iconWrapper}>
                    <ThumbsUp size={24} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>Trusted Customer Service</span>
                </motion.div>
                <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
                  <div className={styles.iconWrapper}>
                    <Truck size={24} color="#1A1A1A" />
                  </div>
                  <span className={styles.statText}>Fast & Secure Delivery</span>
                </motion.div>
              </div>
            </div>

            {/* Right side: Explanations (Text) */}
            <div className={styles.aboutTextRight}>
              <motion.div
                className={styles.aboutBottom}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <p className={styles.aboutText}>
                    <strong>AXASZ STORE</strong> was founded with one simple vision: to redefine the online sneaker shopping experience. We combine premium craftsmanship, authentic products, and contemporary fashion to offer footwear that complements every lifestyle. From timeless classics to the latest releases, our collections are designed for individuals who appreciate quality, comfort, and standout style.
                  </p>
                  <p className={styles.aboutText}>
                    Customer satisfaction is at the heart of everything we do. We continuously update our collection with carefully selected designs while ensuring secure shopping, fast delivery, and dependable support. Every purchase reflects our commitment to excellence and our passion for sneaker culture.
                  </p>
                  <p className={styles.aboutText}>
                    At AXASZ STORE, every step tells a story. Let us help you find the perfect pair that inspires confidence, enhances your style, and keeps you moving forward with comfort and class.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.p
          className={styles.aboutFooter}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.10 }}
        >

          "We believe every sneaker tells a story. Our goal is to deliver stylish, authentic footwear with the best shopping experience."

        </motion.p>
      </section>

      {/* HOW TO ORDER SECTION */}
      <HowToOrderSection />

      {/* STORE SECTION */}
      <section id="products" className={styles.brandsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}> Shop Our Collection</h2>
        </div>

        <div className={styles.brandCardsGrid}>
          {BRANDS.map((brand) => {
            const logoSlug = brand.toLowerCase().replace(' ', '');
            return (
              <div
                key={brand}
                className={`${styles.brandCard} ${activeBrand === brand ? styles.activeBrandCard : ""}`}
                onClick={() => setActiveBrand(brand)}
              >
                <div className={styles.brandCardContent}>
                  {brand !== "All Brands" && (
                    <img
                      src={`/brands/${logoSlug}.svg`}
                      alt={`${brand} logo`}
                      className={styles.brandLogoInline}
                    />
                  )}
                  <span className={styles.brandCardName}>{brand}</span>
                </div>
              </div>
            );
          })}
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
                <option value="Under ₹1,000">Under ₹1,000</option>
                <option value="₹1,000 - ₹2,000">₹1,000 - ₹2,000</option>
                <option value="Over ₹2,000">Over ₹2,000</option>
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
                key={product._id}
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

      {/* CONTACT SECTION */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactBackground}></div>
        <div className={styles.contactWrapper}>
          <div className={styles.contactGrid}>
            {/* Left: Contact Info */}
            <motion.div
              className={styles.contactLeft}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.contactBadge}>WE'RE HERE TO HELP</div>
              <h2 className={styles.contactTitle}>Let's Talk<br />Sneakers</h2>
              <div className={styles.contactUnderline}></div>

              <p className={styles.contactSubtitle}>
                Looking for a specific drop? Need sizing help?<br />
                Drop us a line and our sneaker experts will<br />
                get back to you.
              </p>

              <div className={styles.contactInfoList}>
                <motion.a 
                  href="mailto:axaszstore@gmail.com"
                  className={styles.contactLine}
                  style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  <div className={styles.contactIconCircle}>
                    <Mail size={18} />
                  </div>
                  <div className={styles.contactTextWrapper}>
                    <span className={styles.contactTextMain}>axaszstore@gmail.com</span>
                    <span className={styles.contactTextSub}>Email us anytime</span>
                  </div>
                </motion.a>

                <motion.a 
                  href="https://wa.me/918943029774"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLine}
                  style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  <div className={styles.contactIconCircle}>
                    <WhatsappIcon size={18} />
                  </div>
                  <div className={styles.contactTextWrapper}>
                    <span className={styles.contactTextMain}>+91 8943029774</span>
                    <span className={styles.contactTextSub}>Mon - Sat, 10AM - 8PM IST</span>
                  </div>
                </motion.a>

                <motion.div className={styles.contactLine}>
                  <div className={styles.contactIconCircle}>
                    <MapPin size={18} />
                  </div>
                  <div className={styles.contactTextWrapper}>
                    <span className={styles.contactTextMain}>Kerala, India</span>
                    <span className={styles.contactTextSub}>We ship PAN India</span>
                  </div>
                </motion.div>

                <motion.a
                  href="https://www.instagram.com/axaszstore?igsh=eGF4ejM5ZGR1ZzJt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLine}
                  style={{ textDecoration: 'none' }}
                >
                  <div className={styles.contactIconCircle}>
                    <InstagramIcon size={18} />
                  </div>
                  <div className={styles.contactTextWrapper}>
                    <span className={styles.contactTextMain}>@axaszstore</span>
                    <span className={styles.contactTextSub}>DM us on Instagram</span>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              className={styles.contactRight}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.contactFormCard}>
                <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <input
                        type="text"
                        placeholder="Your name (e.g. Michael Jc)"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      placeholder="What's on your mind? (e.g. Do you have the Jordan 4s in size 10?)"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    <Send size={18} /> Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>100% Authentic</h4>
              <p>Every pair is verified</p>
            </div>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Lock size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>Secure Payments</h4>
              <p>Safe & trusted checkout</p>
            </div>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Truck size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>Fast Shipping</h4>
              <p>Pan India delivery</p>
            </div>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Headset size={24} />
            </div>
            <div className={styles.featureText}>
              <h4>Customer Support</h4>
              <p>We're here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* THANK YOU BANNER */}
      <section className={styles.thankYouBanner}>
        <div className={styles.tyGlow1}></div>
        <div className={styles.tyGlow2}></div>
        <div className={styles.tyGridOverlay}></div>

        <motion.div
          className={styles.tyGlassCard}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.tyTextSection}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.tyBadge}>Gratitude</div>
              <motion.h2
                className={`${elegantFont.className} ${styles.tyTitle}`}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: '200% auto' }}
              >
                Thank You
              </motion.h2>
              <p className={styles.tySubtitle}>
                FOR SHOPPING IN OUR STORE
              </p>
              <p className={styles.tyDescription}>
                Your support means everything to us. We've crafted this experience just for you. Step into a world of unparalleled style and comfort.
              </p>
              <button
                className={styles.tyButton}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Continue Exploring
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </motion.div>
          </div>

          <div className={styles.tyVisualSection}>
            <motion.div
              className={styles.tyLogoWrapper}
              animate={{ y: [-12, 12, -12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/logo.png" alt="Store Logo" className={styles.tyLogoImage} />
              <div className={styles.tyLogoShadow}></div>
            </motion.div>
            {/* Floating elements */}
            <motion.div
              className={styles.tyFloatElement1}
              animate={{ y: [-15, 15, -15], rotate: [0, 45, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className={styles.tyFloatElement2}
              animate={{ y: [10, -10, 10], rotate: [0, -30, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

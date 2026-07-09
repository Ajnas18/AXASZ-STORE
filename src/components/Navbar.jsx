"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { useStore } from '@/store/useStore';

// Import new UI components
import SearchModal from './ui/SearchModal';
import SideDrawer from './ui/SideDrawer';
import UserDropdown from './ui/UserDropdown';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for new features
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null); // 'cart' or 'fav' or null
  const [isUserOpen, setIsUserOpen] = useState(false);

  const { cart, wishlist } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const userBtnRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100 && !mobileMenuOpen && !isSearchOpen && !drawerMode && !isUserOpen) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, isSearchOpen, drawerMode, isUserOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userBtnRef.current && !userBtnRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : styles.transparent} ${hidden ? styles.hidden : ''}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <Link href="/">
              <Image src="/logo.png" alt="AXASZSTORE" width={60} height={60} style={{ objectFit: 'contain' }} />
            </Link>
          </div>

          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/#how-to-order" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>How to Cop</Link>
            <Link href="/#about" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/#products" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Store</Link>
            <Link href="/#contact" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Search" onClick={() => setIsSearchOpen(true)}>
              <Search size={20} />
            </button>
            <div className={styles.userContainer} ref={userBtnRef} style={{ position: 'relative' }}>
              <button className={styles.iconBtn} aria-label="User Account" onClick={() => setIsUserOpen(!isUserOpen)}>
                <User size={20} />
              </button>
              <UserDropdown isOpen={isUserOpen} />
            </div>
            <button className={styles.iconBtn} aria-label="Wishlist" onClick={() => setDrawerMode('fav')}>
              <Heart size={20} />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </button>
            <button className={styles.iconBtn} aria-label="Cart" onClick={() => setDrawerMode('cart')}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </button>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SideDrawer isOpen={!!drawerMode} mode={drawerMode} onClose={() => setDrawerMode(null)} />
    </>
  );
}

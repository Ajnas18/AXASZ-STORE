import React, { useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import styles from './SearchModal.module.css';

export default function SearchModal({ isOpen, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const popularSearches = ["Nike Air Max", "Adidas Yeezy", "New Balance 550", "Running Shoes"];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.searchContainer}>
        <div className={styles.searchHeader}>
          <div className={styles.inputWrapper}>
            <Search className={styles.searchIcon} size={24} />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search for sneakers, brands, or collections..." 
              className={styles.searchInput}
            />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
            <X size={28} />
          </button>
        </div>

        <div className={styles.suggestions}>
          <h3><TrendingUp size={18} /> Popular Searches</h3>
          <div className={styles.tags}>
            {popularSearches.map((term) => (
              <button key={term} className={styles.tagBtn}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.backdrop} onClick={onClose} />
    </div>
  );
}

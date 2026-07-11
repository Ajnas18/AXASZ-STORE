"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { urlFor } from '@/sanity/client';
import styles from './SearchModal.module.css';

export default function SearchModal({ isOpen, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lock scroll when open and focus search input
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

  // Fetch products from our internal API when modal opens
  useEffect(() => {
    if (!isOpen) {
      setQuery(''); // Reset query when modal closes
      return;
    }

    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setProducts(data || []);
          }
        } else {
          console.error("Failed to fetch products from search API");
        }
      } catch (err) {
        console.error("Error fetching products in SearchModal:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filter products by search terms matching name, brand, or SKU
  const filteredProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    const searchTerms = trimmed.split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const code = (p.productCode || '').toLowerCase();
      return searchTerms.every(term => 
        name.includes(term) || brand.includes(term) || code.includes(term)
      );
    });
  }, [query, products]);

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                onClick={() => setQuery('')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
            <X size={28} />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Searching for sneakers...</p>
          </div>
        )}

        {/* Results list */}
        {!loading && query && (
          <div className={styles.resultsContainer}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Link 
                  key={product._id} 
                  href={`/try/${product._id}`} 
                  className={styles.resultItem}
                  onClick={onClose}
                >
                  <img 
                    src={
                      product.image 
                        ? urlFor(product.image).url() 
                        : (product.images && product.images.length > 0 
                            ? urlFor(product.images[0]).url() 
                            : '/placeholder1.jpg')
                    } 
                    alt={product.name} 
                    className={styles.resultImage}
                  />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultBrand}>{product.brand}</span>
                    <span className={styles.resultName}>{product.name}</span>
                    {product.productCode && (
                      <span className={styles.resultSku}>SKU: {product.productCode}</span>
                    )}
                  </div>
                  <span className={styles.resultPrice}>₹{product.price.toLocaleString()}</span>
                </Link>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No products found matching "{query}"</p>
              </div>
            )}
          </div>
        )}

        {/* Popular searches suggestions */}
        {!query && !loading && (
          <div className={styles.suggestions}>
            <h3><TrendingUp size={18} /> Popular Searches</h3>
            <div className={styles.tags}>
              {popularSearches.map((term) => (
                <button 
                  key={term} 
                  className={styles.tagBtn}
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.backdrop} onClick={onClose} />
    </div>
  );
}

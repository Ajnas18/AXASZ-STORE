"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { getProductUrl, getProductShareText } from '@/lib/productUrl';
import { triggerToast } from './Toast';
import { urlFor } from '@/sanity/client';
import styles from './ShareModal.module.css';

// SVG Icons for clean vector branding
const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function ShareModal({ isOpen, onClose, product }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const modalRef = useRef(null);

  const productUrl = product ? getProductUrl(product) : '';
  const shareText = product ? getProductShareText(product, productUrl) : '';

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Resolve thumbnail image
  let imageSrc = '/placeholder1.jpg';
  try {
    if (product.image) {
      imageSrc = urlFor(product.image).width(120).height(120).url();
    } else if (product.images && product.images.length > 0) {
      imageSrc = urlFor(product.images[0]).width(120).height(120).url();
    }
  } catch (e) {
    imageSrc = '/placeholder1.jpg';
  }

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = productUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      triggerToast('Product link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle Native Device Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | AXASZSTORE`,
          text: `Check out this product from AXASZSTORE: ${product.name}`,
          url: productUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  // WhatsApp Share URL
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  // Twitter/X Share URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} from AXASZSTORE:`)}&url=${encodeURIComponent(productUrl)}`;

  // Facebook Share URL
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  return (
    <AnimatePresence>
      <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
        <motion.div
          ref={modalRef}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className={styles.header}>
            <h3 className={styles.headerTitle}>Share Product</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close share menu">
              <X size={18} />
            </button>
          </div>

          {/* Product Snippet */}
          <div className={styles.productSnippet}>
            <img src={imageSrc} alt={product.name} className={styles.productImg} />
            <div className={styles.productMeta}>
              <span className={styles.productBrand}>{product.brand}</span>
              <span className={styles.productName}>{product.name}</span>
              <span className={styles.productPrice}>₹{product.price?.toLocaleString()}</span>
            </div>
          </div>

          {/* Share Channels */}
          <div className={styles.platformsSection}>
            <div className={styles.sectionLabel}>Share via</div>
            <div className={styles.platformsGrid}>
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformBtn}
                aria-label="Share on WhatsApp"
              >
                <div className={`${styles.platformIconWrap} ${styles.whatsappIcon}`}>
                  <WhatsAppIcon />
                </div>
                <span className={styles.platformName}>WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformBtn}
                aria-label="Share on X / Twitter"
              >
                <div className={`${styles.platformIconWrap} ${styles.twitterIcon}`}>
                  <TwitterXIcon />
                </div>
                <span className={styles.platformName}>X</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformBtn}
                aria-label="Share on Facebook"
              >
                <div className={`${styles.platformIconWrap} ${styles.facebookIcon}`}>
                  <FacebookIcon />
                </div>
                <span className={styles.platformName}>Facebook</span>
              </a>

              {/* Instagram or Device Share */}
              {canNativeShare ? (
                <button
                  className={styles.platformBtn}
                  onClick={handleNativeShare}
                  aria-label="Share with device options"
                >
                  <div className={`${styles.platformIconWrap} ${styles.nativeShareIcon}`}>
                    <Share2 size={20} />
                  </div>
                  <span className={styles.platformName}>More</span>
                </button>
              ) : (
                <a
                  href="https://www.instagram.com/axaszstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.platformBtn}
                  onClick={() => {
                    handleCopyLink();
                  }}
                  aria-label="Share on Instagram"
                >
                  <div className={`${styles.platformIconWrap} ${styles.instagramIcon}`}>
                    <InstagramIcon />
                  </div>
                  <span className={styles.platformName}>Instagram</span>
                </a>
              )}
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className={styles.copySection}>
            <div className={styles.sectionLabel}>Page Link</div>
            <div className={styles.linkBox}>
              <input
                type="text"
                readOnly
                value={productUrl}
                className={styles.linkInput}
                onClick={(e) => e.target.select()}
                aria-label="Product URL link"
              />
              <button
                className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                onClick={handleCopyLink}
                aria-label="Copy product link"
              >
                {copied ? (
                  <>
                    <Check size={15} strokeWidth={2.5} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

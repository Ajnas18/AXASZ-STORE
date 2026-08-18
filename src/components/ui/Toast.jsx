"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, AlertCircle } from 'lucide-react';
import styles from './Toast.module.css';

// Global toast trigger helper for anywhere in the app
export function triggerToast(message, type = 'success', duration = 2500) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('axasz-toast', {
      detail: { message, type, duration, id: Date.now() + Math.random() },
    });
    window.dispatchEvent(event);
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type = 'success', duration = 2500, id } = e.detail;
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener('axasz-toast', handleToast);
    return () => window.removeEventListener('axasz-toast', handleToast);
  }, []);

  return (
    <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={styles.toast}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.iconWrapper}>
              {toast.type === 'error' ? (
                <AlertCircle size={14} color="#ef4444" />
              ) : toast.type === 'info' ? (
                <Info size={14} color="#3b82f6" />
              ) : (
                <Check size={14} color="#22c55e" strokeWidth={3} />
              )}
            </div>
            <span className={styles.message}>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

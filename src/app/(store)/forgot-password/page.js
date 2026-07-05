"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || 'If that email exists, a reset link has been sent.');
        if (data.testUrl) {
          setMessage(
            <span>
              If that email exists, a reset link has been sent.<br /><br />
              <b>[Test Mode]</b> <a href={data.testUrl} target="_blank" rel="noreferrer" style={{color: 'blue', textDecoration: 'underline'}}>Click here to view the email preview</a>
            </span>
          );
        }
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('An error occurred while requesting reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.formWrapper}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.header}>
          <Link href="/">
            <img src="/logo.png" alt="AXASZ STORE" className={styles.logo} style={{cursor: 'pointer'}}/>
          </Link>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', background: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.icon} />
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Sending...' : <><>Send Reset Link</> <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Remember your password? <Link href="/login">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

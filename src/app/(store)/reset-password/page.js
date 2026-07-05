"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password has been successfully reset. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('An error occurred while resetting password.');
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
          <h2>Set New Password</h2>
          <p>Please enter your new secure password.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', background: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token || message}
              />
              <button 
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                disabled={!token || message}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!token || message}
              />
              <button 
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!token || message}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading || !token || message}>
            {isLoading ? 'Resetting...' : <><>Reset Password</> <ArrowRight size={18} /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

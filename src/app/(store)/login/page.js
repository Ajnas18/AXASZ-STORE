"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const res = await login(formData.email, formData.password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Login failed');
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
          <h2>Welcome Back</h2>
          <p>Sign in to access your orders and saved items.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.icon} />
              <input 
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Secure Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button 
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p style={{textAlign: 'right', marginTop: '0.5rem', fontSize: '0.85rem'}}>
              <Link href="/forgot-password" style={{color: '#666', textDecoration: 'underline'}}>Forgot Password?</Link>
            </p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Signing In...' : <><>Sign In</> <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? <Link href="/register">Create Account</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

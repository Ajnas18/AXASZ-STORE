"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const res = await register(formData.name, formData.email, formData.phone, formData.password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
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
          <img src="/logo.png" alt="AXASZ STORE" className={styles.logo} />
          <h2>Create Account</h2>
          <p>Join us to get the latest sneaker drops and exclusive offers.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.icon} />
              <input 
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

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
            <label>Phone Number (Optional)</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.icon} />
              <input 
                type="tel" 
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                minLength={8}
              />
              <button 
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className={styles.passwordHint}>Must be at least 8 characters long.</p>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : <><>Create Account</> <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/login">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

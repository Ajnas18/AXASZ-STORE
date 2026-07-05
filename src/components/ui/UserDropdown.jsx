import React from 'react';
import { LogIn, UserPlus, Settings, HelpCircle, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './UserDropdown.module.css';

export default function UserDropdown({ isOpen }) {
  const { user, logout } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <p>Welcome to AXASZ</p>
      </div>
      
      {!user ? (
        <>
          <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Login</p>
          </div>
          <div className={styles.authButtons}>
            <Link href="/login" className={styles.loginBtn} style={{ textDecoration: 'none', background: '#000', color: '#fff', border: 'none' }}>
              <LogIn size={16} /> Login
            </Link>
            <Link href="/register" className={styles.registerBtn} style={{ textDecoration: 'none', background: '#f5f5f5', color: '#000', border: '1px solid #eee' }}>
              <UserPlus size={16} /> Register
            </Link>
          </div>
        </>
      ) : (
        <div className={styles.authButtons} style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem' }}>Hi, {user.name}</p>
          <Link href="/dashboard" className={styles.loginBtn} style={{ textDecoration: 'none', background: '#000', color: '#fff', border: 'none', width: '100%', justifyContent: 'center' }}>
            <Settings size={16} /> Dashboard
          </Link>
          <button onClick={() => logout()} className={styles.registerBtn} style={{ background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      <div className={styles.divider} />
      <ul className={styles.menuList}>
        <li>
          <Link href={user ? "/dashboard" : "/login"} className={styles.menuItem} style={{ textDecoration: 'none' }}>
            <Package size={16} /> My Orders
          </Link>
        </li>
        <li>
          <a href="https://wa.me/918943029774" target="_blank" rel="noopener noreferrer" className={styles.menuItem} style={{ textDecoration: 'none' }}>
            <HelpCircle size={16} /> Contact Support
          </a>
        </li>
      </ul>
    </div>
  );
}

import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

const InstagramIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.logo}>AXASZ STORE</div>
          <p className={styles.description}>
            We believe every sneaker tells a story. Our goal is to deliver stylish, authentic footwear with the best shopping experience. Est. 2023.
          </p>
        </div>
        
        <div className={styles.column}>
          <h3 className={styles.title}>Quick Links</h3>
          <div className={styles.linkList}>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href="/#about" className={styles.link}>About</Link>
            <Link href="/#products" className={styles.link}>Store</Link>
            <Link href="/#contact" className={styles.link}>Contact</Link>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Available Brands</h3>
          <div className={styles.linkList}>
            <span className={styles.link}>Nike</span>
            <span className={styles.link}>Adidas</span>
            <span className={styles.link}>Puma</span>
            <span className={styles.link}>New Balance</span>
            <span className={styles.link}>Converse</span>
            <span className={styles.link}>Vans</span>
            <span className={styles.link}>Jordan</span>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Contact Info</h3>
          <div className={styles.linkList}>
            <div className={styles.contactItem}>
              <InstagramIcon size={18} /> 
              <a href="https://www.instagram.com/axaszstore?igsh=eGF4ejM5ZGR1ZzJt" target="_blank" rel="noopener noreferrer" className={styles.link}>
                @axaszstore
              </a>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} /> 
              <a href="mailto:axaszstore@gmail.com" className={styles.link}>
                axaszstore@gmail.com
              </a>
            </div>
            <div className={styles.contactItem}>
              <MessageCircle size={18} /> 
              <a href="https://wa.me/918943029774" target="_blank" rel="noopener noreferrer" className={styles.link}>
                +91 8943029774
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; 2026 AXASZ STORE. All Rights Reserved.</p>
        <p>Premium Sneakers for Everyone</p>
      </div>
    </footer>
  );
}

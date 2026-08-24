import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  RefreshCcw, 
  Ban, 
  Truck, 
  Calendar, 
  ChevronRight, 
  Mail, 
  MessageCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import styles from './PolicyLayout.module.css';

const policyLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck, slug: 'privacy-policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: FileText, slug: 'terms-and-conditions' },
  { href: '/refund-policy', label: 'Refund Policy', icon: RefreshCcw, slug: 'refund-policy' },
  { href: '/cancellation-policy', label: 'Cancellation Policy', icon: Ban, slug: 'cancellation-policy' },
  { href: '/shipping-policy', label: 'Shipping & Delivery', icon: Truck, slug: 'shipping-policy' },
];

export default function PolicyLayout({
  title,
  badgeText = "Legal & Compliance",
  lastUpdated = "February 2026",
  activeSlug,
  children
}) {
  return (
    <div className={styles.policyContainer}>
      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/#about" className={styles.breadcrumbLink}>Legal</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbCurrent}>{title}</span>
          </nav>

          <div className={styles.badge}>
            <ShieldCheck size={14} />
            <span>{badgeText}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <Calendar size={15} />
              <span>Effective Date: January 1, 2026</span>
            </div>
            <div className={styles.metaItem}>
              <span>•</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className={styles.metaItem}>
              <span>•</span>
              <span>AXASZ STORE Marketplace</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <main className={styles.mainLayout}>
        {/* Sticky Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.navCard}>
            <div className={styles.navTitle}>Store Policies</div>
            <ul className={styles.navList}>
              {policyLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeSlug === item.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Icon size={16} />
                        {item.label}
                      </span>
                      <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.4 }} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Support Card */}
          <div className={styles.supportCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <HelpCircle size={18} color="#1A1A1A" />
              <h3 className={styles.supportTitle} style={{ margin: 0 }}>Need Assistance?</h3>
            </div>
            <p className={styles.supportText}>
              Have questions regarding any of our terms, order tracking, or return procedures? Our support team is ready to assist you.
            </p>
            <div className={styles.supportButtons}>
              <a
                href="https://wa.me/918943029774"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.supportBtn} ${styles.supportBtnPrimary}`}
              >
                <MessageCircle size={16} />
                WhatsApp Support
              </a>
              <a
                href="mailto:axaszstore@gmail.com"
                className={`${styles.supportBtn} ${styles.supportBtnSecondary}`}
              >
                <Mail size={16} />
                Email Support
              </a>
            </div>
          </div>
        </aside>

        {/* Content Card */}
        <article className={styles.contentCard}>
          {children}

          {/* Bottom Help Banner */}
          <div className={styles.contactBanner}>
            <div>
              <h4 className={styles.contactBannerTitle}>Questions about this policy?</h4>
              <p className={styles.contactBannerText}>
                We are committed to transparent policies and a trustworthy shopping environment for all buyers and sellers.
              </p>
            </div>
            <Link href="/#contact" className={styles.contactBannerBtn}>
              Contact Us
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}

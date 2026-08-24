import React from 'react';
import PolicyLayout from '@/components/policy/PolicyLayout';
import styles from '@/components/policy/PolicyLayout.module.css';
import { Lock, Eye, Shield, Users, CreditCard, Bell } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | AXASZ STORE',
  description: 'Learn how AXASZ STORE collects, uses, protects, and handles your personal information across our multi-vendor sneaker marketplace platform.',
  openGraph: {
    title: 'Privacy Policy | AXASZ STORE',
    description: 'Learn how AXASZ STORE protects your personal information, handles secure payments, and processes orders.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      badgeText="Data Protection & Privacy"
      lastUpdated="February 24, 2026"
      activeSlug="privacy-policy"
    >
      <p className={styles.intro}>
        At <strong>AXASZ STORE</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), accessible from <strong>axaszstore.com</strong>, protecting your privacy and personal data is one of our highest priorities. This Privacy Policy details how we collect, utilize, store, share, and protect your information when you visit our website, register an account, or purchase authentic footwear through our online marketplace.
      </p>

      {/* Section 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>1</span>
          Information We Collect
        </h2>
        <p className={styles.paragraph}>
          To provide you with a seamless and personalized shopping experience across our marketplace, we may collect various types of information, including:
        </p>

        <div className={styles.gridCards}>
          <div className={styles.gridCard}>
            <Users size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Personal Identification</h3>
            <p className={styles.gridCardText}>Full name, email address, phone number, and account login credentials.</p>
          </div>
          <div className={styles.gridCard}>
            <CreditCard size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Order & Payment Details</h3>
            <p className={styles.gridCardText}>Shipping address, billing address, order history, and payment transaction references.</p>
          </div>
          <div className={styles.gridCard}>
            <Eye size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Device & Browsing Data</h3>
            <p className={styles.gridCardText}>IP address, browser type, device information, operating system, and pages viewed.</p>
          </div>
        </div>

        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Directly Provided Data:</strong> Information submitted when creating an account, filling out checkout forms, contacting customer support, or subscribing to our newsletters.
          </li>
          <li className={styles.listItem}>
            <strong>Automated Data:</strong> Log files, cookies, and device identifiers collected automatically to optimize performance and prevent fraudulent activity.
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>2</span>
          How We Use Your Information
        </h2>
        <p className={styles.paragraph}>
          We use the information collected from our buyers and visitors for legitimate business and fulfillment purposes:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Order Fulfillment:</strong> Processing, routing, packaging, and delivering your sneaker orders via our network of verified sellers, warehouse hubs, and courier partners.</li>
          <li className={styles.listItem}><strong>Customer Support:</strong> Responding to order inquiries, size exchanges, cancellations, return requests, and technical assistance via WhatsApp, email, or live chat.</li>
          <li className={styles.listItem}><strong>Account Administration:</strong> Managing your user profile, saved addresses, wishlist items, and order history.</li>
          <li className={styles.listItem}><strong>Security & Fraud Prevention:</strong> Verifying order authenticity, preventing unauthorized transactions, and safeguarding the marketplace against malicious behavior.</li>
          <li className={styles.listItem}><strong>Service Improvements:</strong> Analyzing site navigation trends to improve user interface, product recommendations, and catalog relevance.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>3</span>
          Marketplace & Third-Party Disclosure
        </h2>
        <p className={styles.paragraph}>
          AXASZ STORE operates as a curated e-commerce marketplace featuring authentic sneakers. We never sell, rent, or trade your personal data to unauthorized third parties. We share your information only under the following strict conditions:
        </p>

        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>Verified Sellers & Logistics Partners</div>
          <p className={styles.calloutBoxText}>
            When you place an order, your name, shipping address, and phone number are shared solely with the specific verified seller/dealer fulfilling your product and our third-party logistics couriers (e.g., Delhivery, Blue Dart, DTDC, India Post) to execute dispatch and delivery. Sellers are bound by confidentiality and prohibited from using your data for independent marketing.
          </p>
        </div>

        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Authorized Service Providers:</strong> Cloud hosting providers, customer messaging services (WhatsApp Business API), and transaction notification providers operating under confidentiality agreements.</li>
          <li className={styles.listItem}><strong>Legal & Regulatory Compliance:</strong> We may disclose information if required by applicable Indian laws, court orders, law enforcement requests, or to enforce our marketplace Terms & Conditions.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>4</span>
          Payment Processing & Financial Security
        </h2>
        <p className={styles.paragraph}>
          All online financial transactions on AXASZ STORE are encrypted and processed through certified, PCI-DSS compliant payment gateways, including <strong>Razorpay</strong> and authorized Indian banking networks (UPI, Netbanking, Debit/Credit Cards, Wallets).
        </p>
        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>Card Data Protection</div>
          <p className={styles.calloutBoxText}>
            AXASZ STORE does <strong>not</strong> collect, store, or view your full credit/debit card numbers, CVV codes, or net banking passwords on our servers. All sensitive financial parameters are handled directly within the encrypted environment of the payment gateway.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>5</span>
          Cookies and Tracking Technologies
        </h2>
        <p className={styles.paragraph}>
          We utilize essential session cookies, analytical cookies, and preference cookies to:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Maintain your shopping cart and active login session between page visits.</li>
          <li className={styles.listItem}>Remember your size preferences and recently viewed sneakers.</li>
          <li className={styles.listItem}>Gather anonymized traffic statistics to improve website responsiveness and load speeds.</li>
        </ul>
        <p className={styles.paragraph}>
          You can configure your browser to decline cookies; however, certain interactive store features (like keeping items in your cart) may not function optimally without them.
        </p>
      </section>

      {/* Section 6 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>6</span>
          Data Retention and User Rights
        </h2>
        <p className={styles.paragraph}>
          We retain your personal information for as long as your account remains active or as needed to provide fulfillment, resolve disputes, comply with statutory tax regulations, and uphold our marketplace agreements.
        </p>
        <p className={styles.paragraph}>
          As an AXASZ STORE user, you hold the following rights regarding your data:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Access & Update:</strong> Review and modify your profile details, delivery addresses, and contact info via your User Dashboard.</li>
          <li className={styles.listItem}><strong>Account Deletion:</strong> Request the deletion of your account and personal identifiers by contacting our support team.</li>
          <li className={styles.listItem}><strong>Communication Opt-Out:</strong> Opt out of promotional communications at any time while continuing to receive critical transactional updates regarding your orders.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>7</span>
          Grievance Officer & Contact Information
        </h2>
        <p className={styles.paragraph}>
          In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, if you have any questions, concerns, or grievances regarding our privacy practices, please contact our Grievance Officer:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <th style={{ width: '30%' }}>Platform</th>
                <td>AXASZ STORE (axaszstore.com)</td>
              </tr>
              <tr>
                <th>Grievance Email</th>
                <td><a href="mailto:axaszstore@gmail.com" style={{ color: '#1A1A1A', fontWeight: 600 }}>axaszstore@gmail.com</a></td>
              </tr>
              <tr>
                <th>Support Helpline</th>
                <td><a href="https://wa.me/918943029774" target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A1A', fontWeight: 600 }}>+91 8943029774</a></td>
              </tr>
              <tr>
                <th>Operating Hours</th>
                <td>Monday – Saturday: 10:00 AM to 7:00 PM IST</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PolicyLayout>
  );
}

import React from 'react';
import PolicyLayout from '@/components/policy/PolicyLayout';
import styles from '@/components/policy/PolicyLayout.module.css';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale, ShoppingCart } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | AXASZ STORE',
  description: 'Read the terms and conditions governing the use of the AXASZ STORE multi-vendor sneaker marketplace platform, purchases, seller terms, and user accounts.',
  openGraph: {
    title: 'Terms & Conditions | AXASZ STORE',
    description: 'Understand the user agreement, marketplace policies, and transaction terms of AXASZ STORE.',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      badgeText="User Agreement & Platform Rules"
      lastUpdated="February 24, 2026"
      activeSlug="terms-and-conditions"
    >
      <p className={styles.intro}>
        Welcome to <strong>AXASZ STORE</strong>. These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of our website (<strong>axaszstore.com</strong>), mobile-optimized applications, and related e-commerce services. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our services.
      </p>

      {/* Section 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>1</span>
          About Our Marketplace Platform
        </h2>
        <p className={styles.paragraph}>
          AXASZ STORE is an online e-commerce marketplace platform that connects discerning sneaker enthusiasts with authentic footwear, apparel, and lifestyle merchandise curated from verified sellers, licensed dealers, and independent brands.
        </p>
        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>Marketplace Intermediary Model</div>
          <p className={styles.calloutBoxText}>
            AXASZ STORE facilitates transactions between buyers and registered sellers. While we conduct rigorous seller verification and authenticity audits, each contract of sale for products listed on the platform is concluded directly between the respective seller and buyer. AXASZ STORE acts as a trusted platform provider, transaction facilitator, and customer service coordinator.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>2</span>
          Account Registration and Security
        </h2>
        <p className={styles.paragraph}>
          To access certain features of the platform, including order placement, wishlist tracking, and dashboard management, you may be required to register an account.
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Accuracy:</strong> You agree to provide true, current, and complete information during registration and checkout.</li>
          <li className={styles.listItem}><strong>Confidentiality:</strong> You are responsible for safeguarding your login credentials and password. Any action taken using your authenticated account will be deemed authorized by you.</li>
          <li className={styles.listItem}><strong>Eligibility:</strong> You must be at least 18 years of age or access the website under the supervision of a parent or legal guardian who agrees to be bound by these Terms.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>3</span>
          Product Listings, Pricing & Authenticity Guarantee
        </h2>
        <p className={styles.paragraph}>
          We take the trust of our sneaker community seriously:
        </p>
        <div className={styles.gridCards}>
          <div className={styles.gridCard}>
            <ShieldCheck size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>100% Authenticity Guarantee</h3>
            <p className={styles.gridCardText}>All listed sneakers are sourced through authorized dealer channels and undergo verification checks prior to dispatch.</p>
          </div>
          <div className={styles.gridCard}>
            <ShoppingCart size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Pricing & Availability</h3>
            <p className={styles.gridCardText}>All prices are displayed in Indian Rupees (INR) and include applicable taxes unless specified otherwise.</p>
          </div>
          <div className={styles.gridCard}>
            <AlertTriangle size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Typographical Errors</h3>
            <p className={styles.gridCardText}>In the event of an inadvertent pricing or catalog error, we reserve the right to cancel the order with an immediate 100% refund.</p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>4</span>
          Order Placement, Payment & Confirmation
        </h2>
        <p className={styles.paragraph}>
          When you place an order on AXASZ STORE, it constitutes an offer to purchase. An order is accepted once we or the seller verifies inventory availability, processes payment verification, and issues an official dispatch confirmation via Email, SMS, or WhatsApp.
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Online Payments:</strong> We accept UPI, Debit Cards, Credit Cards, Net Banking, and authorized Wallets via certified payment gateways including Razorpay.</li>
          <li className={styles.listItem}><strong>Payment Authorization:</strong> By initiating a payment, you warrant that you are authorized to use the designated payment method.</li>
          <li className={styles.listItem}><strong>Cash on Delivery (COD) / Assisted Orders:</strong> COD options, where available, may be subject to phone or WhatsApp verification prior to dispatch to prevent fake bookings.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>5</span>
          Seller Obligations and Marketplace Standards
        </h2>
        <p className={styles.paragraph}>
          All third-party sellers and brand dealers participating in the AXASZ STORE marketplace platform agree to:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Supply only authentic, brand-new, and unworn footwear in original manufacturer retail packaging.</li>
          <li className={styles.listItem}>Dispatch accepted orders within the agreed turnaround time (standard 24 to 48 hours).</li>
          <li className={styles.listItem}>Honor AXASZ STORE&apos;s unified Refund, Cancellation, and Warranty policies.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>6</span>
          Intellectual Property Rights
        </h2>
        <p className={styles.paragraph}>
          The website design, brand trademarks, logos, custom graphics, UI components, code, text, and imagery created by AXASZ STORE are protected under applicable intellectual property and copyright laws.
        </p>
        <p className={styles.paragraph}>
          All third-party brand names, logos, and model trademarks (such as Nike, Adidas, Jordan, Puma, New Balance, Converse, Vans) belong to their respective trademark holders. Their display on our platform is solely for descriptive and identification purposes in connection with legitimate resale.
        </p>
      </section>

      {/* Section 7 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>7</span>
          Limitation of Liability & Indemnification
        </h2>
        <p className={styles.paragraph}>
          To the maximum extent permitted by applicable Indian law, AXASZ STORE, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our platform or purchased products.
        </p>
        <p className={styles.paragraph}>
          In any event, AXASZ STORE&apos;s total aggregate liability to you for any claim arising out of or relating to these Terms or a specific transaction shall not exceed the actual amount paid by you for the order in question.
        </p>
      </section>

      {/* Section 8 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>8</span>
          Governing Law & Dispute Resolution
        </h2>
        <p className={styles.paragraph}>
          These Terms and any contractual disputes arising out of your use of AXASZ STORE shall be governed by and construed in accordance with the laws of <strong>India</strong>.
        </p>
        <p className={styles.paragraph}>
          Any dispute, controversy, or claim that cannot be resolved amicably through our customer support mediation within thirty (30) days shall be subject to the exclusive jurisdiction of the competent courts in Kerala, India.
        </p>
      </section>

      {/* Section 9 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>9</span>
          Modifications to Terms
        </h2>
        <p className={styles.paragraph}>
          We reserve the right to revise or update these Terms at any time to reflect operational, legal, or regulatory modifications. The &quot;Last Updated&quot; timestamp at the top of this document indicates when changes were made. Your continued use of the platform following the posting of updated Terms constitutes your binding acceptance.
        </p>
      </section>
    </PolicyLayout>
  );
}

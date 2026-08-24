import React from 'react';
import PolicyLayout from '@/components/policy/PolicyLayout';
import styles from '@/components/policy/PolicyLayout.module.css';
import { RefreshCcw, CheckCircle2, XCircle, Clock, CreditCard, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | AXASZ STORE',
  description: 'Understand the return, replacement, and refund policies for sneaker purchases on the AXASZ STORE marketplace platform.',
  openGraph: {
    title: 'Refund Policy | AXASZ STORE',
    description: 'Learn about our 7-day return window, quality inspection, and quick refund timelines on AXASZ STORE.',
  },
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund & Return Policy"
      badgeText="Returns & Money Back Guarantee"
      lastUpdated="February 24, 2026"
      activeSlug="refund-policy"
    >
      <p className={styles.intro}>
        At <strong>AXASZ STORE</strong>, we stand behind the authenticity and quality of every sneaker we curate. We want you to feel completely confident with your purchase. If your order does not meet your expectations, our transparent <strong>7-Day Return and Refund Policy</strong> is here to assist you.
      </p>

      {/* Section 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>1</span>
          7-Day Return Window & Eligibility
        </h2>
        <p className={styles.paragraph}>
          You may request a return, size exchange, or refund within <strong>7 calendar days</strong> from the date of confirmed delivery.
        </p>

        <div className={styles.gridCards}>
          <div className={styles.gridCard}>
            <CheckCircle2 size={24} color="#25D366" className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Eligible for Return</h3>
            <p className={styles.gridCardText}>
              Shoes must be brand-new, unworn, unwashed, with all original brand tags, QR authenticity seals, and extra laces attached.
            </p>
          </div>
          <div className={styles.gridCard}>
            <ShieldCheck size={24} color="#1A1A1A" className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Original Box Required</h3>
            <p className={styles.gridCardText}>
              The manufacturer&apos;s branded shoe box is an essential part of the product and must be returned intact without tape stuck directly onto it.
            </p>
          </div>
          <div className={styles.gridCard}>
            <XCircle size={24} color="#E53935" className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Non-Eligible Condition</h3>
            <p className={styles.gridCardText}>
              Footwear showing signs of outdoor wear, creasing, dirt on the outsoles, missing tags, or damaged shoe boxes cannot be accepted.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>2</span>
          Damaged, Defective, or Incorrect Items
        </h2>
        <p className={styles.paragraph}>
          In the rare event that you receive a defective item, a product damaged during transit, or a different size/color than what was ordered:
        </p>
        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>48-Hour Reporting Protocol</div>
          <p className={styles.calloutBoxText}>
            Please report any transit damage or discrepancies to our team within <strong>48 hours of delivery</strong> by sending photos or a short unboxing video along with your Order ID to <strong>axaszstore@gmail.com</strong> or our WhatsApp helpline at <strong>+91 8943029774</strong>. We will arrange an immediate priority replacement or full refund at zero extra cost to you.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>3</span>
          Marketplace Quality Inspection Process
        </h2>
        <p className={styles.paragraph}>
          Because AXASZ STORE works with verified footwear dealers and sellers:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Reverse Pickup:</strong> Once your return request is approved, our logistics partner will pick up the package from your address within 24 to 48 hours.
          </li>
          <li className={styles.listItem}>
            <strong>Quality Check (QC):</strong> Upon arrival at our verification hub or the respective seller&apos;s warehouse, the item undergoes a mandatory 24-hour quality verification to ensure the footwear is unworn and tags remain intact.
          </li>
          <li className={styles.listItem}>
            <strong>QC Approval:</strong> Once approved, the refund or exchange is immediately initiated.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>4</span>
          Refund Methods & Timelines
        </h2>
        <p className={styles.paragraph}>
          Refunds are issued promptly according to the original payment method used during checkout:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Payment Mode</th>
                <th>Refund Channel</th>
                <th>Estimated Processing Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Prepaid (UPI / Card / Netbanking via Razorpay)</strong></td>
                <td>Reversed directly to the original bank account, debit/credit card, or UPI VPA</td>
                <td>5 to 7 business days after QC approval</td>
              </tr>
              <tr>
                <td><strong>Cash on Delivery (COD) / Direct Transfer</strong></td>
                <td>Transferred securely to the buyer&apos;s verified bank account or UPI ID</td>
                <td>2 to 4 business days after receiving account details</td>
              </tr>
              <tr>
                <td><strong>Store Credit / Gift Voucher (Optional)</strong></td>
                <td>Instant wallet credit issued to your AXASZ STORE account</td>
                <td>Within 24 hours (No deduction)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>5</span>
          Step-by-Step Return Process
        </h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Step 1:</strong> Reach out to us with your Order ID, reason for return, and shoe photos via WhatsApp (<strong>+91 8943029774</strong>) or email (<strong>axaszstore@gmail.com</strong>).
          </li>
          <li className={styles.listItem}>
            <strong>Step 2:</strong> Pack the footwear securely in its original manufacturer box, and place it inside an outer protective parcel bag/box to prevent box damage during transit.
          </li>
          <li className={styles.listItem}>
            <strong>Step 3:</strong> Hand over the parcel to our scheduled courier partner.
          </li>
          <li className={styles.listItem}>
            <strong>Step 4:</strong> Receive your full refund or tracking details for your replacement pair once quality checks are completed.
          </li>
        </ul>
      </section>
    </PolicyLayout>
  );
}

import React from 'react';
import PolicyLayout from '@/components/policy/PolicyLayout';
import styles from '@/components/policy/PolicyLayout.module.css';
import { Ban, Clock, AlertCircle, RefreshCcw, CheckCircle, Package } from 'lucide-react';

export const metadata = {
  title: 'Cancellation Policy | AXASZ STORE',
  description: 'Understand the cancellation rules, timelines, and refund procedures for orders placed on AXASZ STORE.',
  openGraph: {
    title: 'Cancellation Policy | AXASZ STORE',
    description: 'Learn how to cancel your sneaker orders before dispatch and understand seller cancellation safeguards on AXASZ STORE.',
  },
};

export default function CancellationPolicyPage() {
  return (
    <PolicyLayout
      title="Cancellation Policy"
      badgeText="Order Cancellation & Safeguards"
      lastUpdated="February 24, 2026"
      activeSlug="cancellation-policy"
    >
      <p className={styles.intro}>
        At <strong>AXASZ STORE</strong>, we understand that you may occasionally need to cancel an order after placing it. We strive to make our cancellation process straightforward, fair, and fast.
      </p>

      {/* Section 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>1</span>
          Customer Order Cancellation (Pre-Dispatch)
        </h2>
        <p className={styles.paragraph}>
          You have the right to cancel your order at <strong>any time before the order has been dispatched</strong> from our seller&apos;s fulfillment facility or warehouse.
        </p>

        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>100% Full Refund Guarantee</div>
          <p className={styles.calloutBoxText}>
            If you cancel your prepaid order before dispatch, a full 100% refund (including any shipping fees paid) will be initiated immediately with zero cancellation penalty.
          </p>
        </div>

        <p className={styles.paragraph}>
          To initiate a pre-dispatch cancellation:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Via WhatsApp Support:</strong> Send a quick message with your <strong>Order ID</strong> to our dedicated helpline at <a href="https://wa.me/918943029774" target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A1A', fontWeight: 600 }}>+91 8943029774</a> for fastest processing.
          </li>
          <li className={styles.listItem}>
            <strong>Via Email:</strong> Send an email with the subject line <em>&quot;Order Cancellation - [Your Order ID]&quot;</em> to <a href="mailto:axaszstore@gmail.com" style={{ color: '#1A1A1A', fontWeight: 600 }}>axaszstore@gmail.com</a>.
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>2</span>
          Cancellation After Dispatch
        </h2>
        <p className={styles.paragraph}>
          Once an order has been picked up and processed by our third-party logistics courier, electronic cancellation is no longer possible because the parcel is already in transit.
        </p>
        <div className={styles.gridCards}>
          <div className={styles.gridCard}>
            <Package size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Refusal upon Delivery</h3>
            <p className={styles.gridCardText}>
              You may politely refuse the parcel at the time of delivery when the courier representative arrives.
            </p>
          </div>
          <div className={styles.gridCard}>
            <RefreshCcw size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>7-Day Return Option</h3>
            <p className={styles.gridCardText}>
              Alternatively, accept the delivery and initiate a standard return within 7 days in accordance with our <a href="/refund-policy" style={{ textDecoration: 'underline' }}>Refund Policy</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>3</span>
          Marketplace & Seller-Initiated Cancellations
        </h2>
        <p className={styles.paragraph}>
          In rare circumstances, an order may need to be cancelled by AXASZ STORE or the registered seller. Common reasons include:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Quality Inspection Failure:</strong> The sneaker pair failed our pre-dispatch authenticity or physical condition quality checks and a suitable replacement is unavailable.</li>
          <li className={styles.listItem}><strong>Inventory Discrepancy:</strong> Sudden stock unavailability or damage discovered at the seller&apos;s hub.</li>
          <li className={styles.listItem}><strong>Non-Serviceable Address:</strong> The provided pin code is unserviceable by all partner courier networks.</li>
          <li className={styles.listItem}><strong>Pricing or Catalog Error:</strong> An obvious, typographical listing error on product specifications or price.</li>
          <li className={styles.listItem}><strong>Unverified COD Orders:</strong> Inability to confirm customer authenticity for high-value Cash on Delivery orders after multiple contact attempts.</li>
        </ul>
        <p className={styles.paragraph}>
          In all such cases, you will be notified immediately via WhatsApp/Email, and a <strong>100% full refund</strong> will be credited back to your original payment method.
        </p>
      </section>

      {/* Section 4 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>4</span>
          Refund Timelines for Cancelled Orders
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cancellation Type</th>
                <th>Refund Action</th>
                <th>Credited Within</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pre-Dispatch Cancellation (Prepaid)</td>
                <td>Initiated within 24 hours of cancellation confirmation</td>
                <td>5 to 7 business days via original payment method (Razorpay/Bank)</td>
              </tr>
              <tr>
                <td>Seller-Initiated Cancellation</td>
                <td>Initiated within 24 hours automatically</td>
                <td>5 to 7 business days</td>
              </tr>
              <tr>
                <td>Cash on Delivery (Pre-Dispatch)</td>
                <td>Order cancelled immediately; no financial transaction involved</td>
                <td>N/A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PolicyLayout>
  );
}

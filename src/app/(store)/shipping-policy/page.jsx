import React from 'react';
import PolicyLayout from '@/components/policy/PolicyLayout';
import styles from '@/components/policy/PolicyLayout.module.css';
import { Truck, Clock, MapPin, PackageCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy | AXASZ STORE',
  description: 'Learn about AXASZ STORE shipping rates, pan-India delivery timeframes, tracking updates, and multi-vendor parcel fulfillment.',
  openGraph: {
    title: 'Shipping & Delivery Policy | AXASZ STORE',
    description: 'Find out about our fast pan-India courier shipping, delivery timelines, and real-time order tracking.',
  },
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      badgeText="Pan-India Logistics & Delivery"
      lastUpdated="February 24, 2026"
      activeSlug="shipping-policy"
    >
      <p className={styles.intro}>
        At <strong>AXASZ STORE</strong>, we are committed to delivering your authentic sneakers quickly, safely, and securely across India. We partner with India&apos;s leading logistics networks (including Delhivery, Blue Dart, DTDC, ExpressBees, and India Post) to ensure seamless delivery to your doorstep.
      </p>

      {/* Section 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>1</span>
          Order Processing & Verification Timelines
        </h2>
        <p className={styles.paragraph}>
          Every order placed on AXASZ STORE undergoes strict physical quality and authenticity screening prior to handover to courier partners:
        </p>

        <div className={styles.gridCards}>
          <div className={styles.gridCard}>
            <Clock size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Processing Window</h3>
            <p className={styles.gridCardText}>Orders are verified, packed in protective double-boxes, and dispatched within <strong>24 to 48 hours</strong>.</p>
          </div>
          <div className={styles.gridCard}>
            <PackageCheck size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Authenticity QC</h3>
            <p className={styles.gridCardText}>Sellers perform comprehensive checks on stitching, colorways, box labels, and sizing before release.</p>
          </div>
          <div className={styles.gridCard}>
            <Truck size={24} className={styles.gridCardIcon} />
            <h3 className={styles.gridCardTitle}>Handover to Courier</h3>
            <p className={styles.gridCardText}>Couriers scan parcels immediately and generate live tracking AWB numbers transmitted directly to you.</p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>2</span>
          Estimated Delivery Timelines (Pan-India)
        </h2>
        <p className={styles.paragraph}>
          Estimated delivery durations from the time of dispatch:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Region / Destination</th>
                <th>Estimated Transit Time</th>
                <th>Logistics Handlers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Kolkata, Hyderabad)</strong></td>
                <td>3 to 5 business days</td>
                <td>Air Express Couriers (Blue Dart / Delhivery Air)</td>
              </tr>
              <tr>
                <td><strong>Tier 2 &amp; Tier 3 Cities</strong></td>
                <td>4 to 7 business days</td>
                <td>Standard Surface Express</td>
              </tr>
              <tr>
                <td><strong>Kerala &amp; South India</strong></td>
                <td>2 to 4 business days</td>
                <td>Regional Priority Delivery</td>
              </tr>
              <tr>
                <td><strong>Remote / North-East / J&amp;K / Islands</strong></td>
                <td>6 to 9 business days</td>
                <td>India Post Speed Post / Regional Specialists</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={styles.paragraph} style={{ fontSize: '0.85rem', color: '#777777' }}>
          *Note: Business days exclude Sundays and national/state public holidays. Deliveries in exceptional weather conditions or during festival peak volumes may experience slight delays.
        </p>
      </section>

      {/* Section 3 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>3</span>
          Shipping Charges & Free Delivery
        </h2>
        <p className={styles.paragraph}>
          Shipping costs, if any, are clearly calculated and presented to you on the Checkout page before you confirm payment:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}><strong>Standard Shipping:</strong> Free shipping may apply to select promotional items or orders exceeding the minimum threshold specified in the cart.</li>
          <li className={styles.listItem}><strong>Transparent Pricing:</strong> No hidden logistics surcharges are added after the order is finalized.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>4</span>
          Multi-Seller Marketplace Fulfillment
        </h2>
        <div className={styles.calloutBox}>
          <div className={styles.calloutBoxTitle}>Multiple Shipments in One Order</div>
          <p className={styles.calloutBoxText}>
            Because AXASZ STORE is a curated multi-seller marketplace, if you purchase multiple pairs of sneakers from different verified sellers in a single order, your items may be shipped separately from different regional hubs. You will receive distinct tracking numbers for each package without paying extra shipping charges.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>5</span>
          Real-Time Tracking & Notifications
        </h2>
        <p className={styles.paragraph}>
          Once your package is picked up by the logistics carrier, we immediately send an automated confirmation containing:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Air Waybill (AWB) / Tracking Number.</li>
          <li className={styles.listItem}>A direct one-click tracking URL to trace parcel movement in real-time.</li>
          <li className={styles.listItem}>WhatsApp delivery updates on out-for-delivery status.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNumber}>6</span>
          Damaged Packaging or Non-Delivery Issues
        </h2>
        <p className={styles.paragraph}>
          If your outer shipping carton appears severely tampered with, opened, or physically crushed at the time of delivery, we recommend you either:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Refuse delivery and note &quot;Package Damaged&quot; on the courier proof of delivery slip; OR</li>
          <li className={styles.listItem}>Take clear photos/video of the unopened outer packaging before and during unboxing.</li>
        </ul>
        <p className={styles.paragraph}>
          Reach out to our helpline at <a href="https://wa.me/918943029774" target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A1A', fontWeight: 600 }}>+91 8943029774</a> or <a href="mailto:axaszstore@gmail.com" style={{ color: '#1A1A1A', fontWeight: 600 }}>axaszstore@gmail.com</a> for immediate assistance.
        </p>
      </section>
    </PolicyLayout>
  );
}

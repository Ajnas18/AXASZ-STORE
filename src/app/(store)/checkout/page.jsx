"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  CheckCircle,
  Loader2,
  X,
  Minus,
  Plus,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { urlFor } from '@/sanity/client';
import styles from './checkout.module.css';

const getProductImageUrl = (image) => {
  if (!image) return '/logo.png';
  if (typeof image === 'string') return image;
  try {
    return urlFor(image).url();
  } catch (e) {
    console.error("Error building image URL:", e);
    return '/logo.png';
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, updateQuantity, removeFromCart } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    country: 'India'
  });

  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      window.scrollTo(0, 0);
    }
  }, [isMounted]);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = 0;
  const totalAmount = subtotal - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, cart, subtotal, discount, totalAmount })
      });

      const storePhoneNumber = '918943029774'; 
      let message = `*New Order from AXASZ STORE*\n\n`;
      message += `*Customer Details:*\n`;
      message += `Name: ${formData.firstName} ${formData.lastName}\n`;
      message += `Phone: ${formData.phone}\n`;
      message += `Email: ${formData.email}\n`;
      message += `Address: ${formData.streetAddress}, ${formData.city}, ${formData.postalCode}, ${formData.country}\n\n`;
      message += `*Order Items:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - Size: ${item.selectedSize} - Qty: ${item.quantity} - ₹${item.price}\n`;
      });
      message += `\n*Total Amount:* ₹${totalAmount.toFixed(2)}`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;
      setWhatsappLink(waUrl);
      setIsSuccess(true);
      setIsSubmitting(false);
      clearCart();
      window.open(waUrl, '_blank');

    } catch (error) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
      alert("There was an error processing your order. Please try again.");
    }
  };

  if (!isMounted) return null;

  /* ── SUCCESS SCREEN ── */
  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={36} />
          </div>
          <h2 className={styles.successTitle}>Order Placed!</h2>
          <p className={styles.successText}>
            Your order has been saved. Send the details via WhatsApp to confirm your order and complete payment.
          </p>
          <div className={styles.successActions}>
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              Send Order to WhatsApp
            </a>
            <Link href="/" className={styles.continueBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN CHECKOUT ── */
  return (
    <div className={styles.page}>
      {/* Top Bar with Logo */}
      <div className={styles.topBar}>
        <Link href="/">
          <img src="/logo.png" alt="AXASZSTORE" className={styles.logoImg} />
        </Link>
      </div>

      <div className={styles.wrapper}>

        {/* ── LEFT: FORM ── */}
        <div className={styles.leftCol}>
          <h1 className={styles.pageTitle}>Checkout</h1>

          {/* Customer Details */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Customer Details</div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Sarah"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Davis"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="mail@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Shipping Details</div>

            <div className={styles.formGroupFull}>
              <label className={styles.label}>Street Address <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="streetAddress"
                required
                value={formData.streetAddress}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="House No., Street, Area"
              />
            </div>

            <div className={styles.formGrid3} style={{ marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Postal Code <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="360005"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>City <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Rajkot"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Country <span className={styles.required}>*</span></label>
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div className={styles.rightCol}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Order Summary</div>

            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <p>Your cart is empty</p>
                <Link href="/" className={styles.shopLink}>Go Shopping</Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className={styles.cartList}>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className={styles.cartItem}>
                      <img
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        {item.productCode && (
                          <div className={styles.itemSku}>SKU: {item.productCode}</div>
                        )}
                        <div className={styles.itemBottom}>
                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            >
                              <Minus size={11} />
                            </button>
                            <span className={styles.qtyNum}>{item.quantity}</span>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <span className={styles.itemPrice}>₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.divider} />

                {/* Discount Code */}
                <div className={styles.discountRow}>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className={styles.discountInput}
                    placeholder="Discount code"
                  />
                  <button type="button" className={styles.applyBtn}>Apply</button>
                </div>

                <div className={styles.divider} />

                {/* Totals */}
                <div className={styles.totalsBlock}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span className={styles.totalVal}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Discount</span>
                    <span className={styles.totalVal}>₹{discount.toFixed(2)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Shipping</span>
                    <span className={styles.totalVal} style={{ color: '#16a34a' }}>Free</span>
                  </div>
                </div>

                <div className={styles.grandRow}>
                  <span className={styles.grandLabel}>Total</span>
                  <span className={styles.grandVal}>₹{totalAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            {/* Submit */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={cart.length === 0 || isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  'Confirm Order'
                )}
              </button>
            </form>

            <div className={styles.securityNote}>
              <ShieldCheck size={12} /> Secure &amp; encrypted checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

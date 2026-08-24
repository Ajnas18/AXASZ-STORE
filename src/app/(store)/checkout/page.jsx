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
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Lock
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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, updateQuantity, removeFromCart } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderSummaryResult, setOrderSummaryResult] = useState(null);
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
    // Preload Razorpay Checkout Script
    loadRazorpayScript();
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

  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
      }

      // 2. Create store order and Razorpay Order on server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, cart, subtotal, discount, totalAmount }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create order on server.');
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = data;

      if (!keyId) {
        throw new Error('Razorpay Public Key ID is missing on the server. Please check environment configuration.');
      }

      // 3. Configure and open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount, // Amount in paise
        currency: currency || 'INR',
        name: 'AXASZ STORE',
        description: `Sneaker Order #${orderId}`,
        image: '/logo.jpeg',
        order_id: razorpayOrderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#111827',
        },
        handler: async function (paymentResponse) {
          // 4. Cryptographic server-side verification
          setIsVerifying(true);
          setIsSubmitting(true);
          
          try {
            const verifyRes = await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // Build WhatsApp confirmation message
            let waUrl = data.adminWhatsappUrl;
            if (!waUrl) {
              const storePhoneNumber = '918943029774';
              let message = `*Paid Order Confirmation - AXASZ STORE*\n\n`;
              message += `*Order ID:* ${orderId}\n`;
              message += `*Razorpay Payment ID:* ${paymentResponse.razorpay_payment_id}\n`;
              message += `*Payment Status:* Verified (PAID)\n\n`;
              message += `*Customer Details:*\n`;
              message += `Name: ${formData.firstName} ${formData.lastName}\n`;
              message += `Phone: ${formData.phone}\n`;
              message += `Email: ${formData.email}\n`;
              message += `Address: ${formData.streetAddress}, ${formData.city}, ${formData.postalCode}, ${formData.country}\n\n`;
              message += `*Order Items:*\n`;
              cart.forEach((item, index) => {
                const colorText = item.selectedColor ? ` - Color: ${item.selectedColor}` : '';
                message += `${index + 1}. ${item.name}${colorText} - Size: UK ${item.selectedSize} - Qty: ${item.quantity} - ₹${item.price}\n`;
              });
              message += `\n*Total Paid:* ₹${totalAmount.toFixed(2)}`;

              const encodedMessage = encodeURIComponent(message);
              waUrl = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;
            }

            setWhatsappLink(waUrl);
            setOrderSummaryResult({
              orderId,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              totalAmount,
              itemCount: cart.length,
              paidAt: verifyData.paidAt || new Date().toISOString(),
              customerEmail: formData.email,
            });

            clearCart();
            setIsSuccess(true);
          } catch (verifyError) {
            console.error('Payment Verification Error:', verifyError);
            setErrorMessage(
              verifyError.message || 'Payment was processed by gateway but server verification failed. Please contact support with your payment ID.'
            );
          } finally {
            setIsVerifying(false);
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setIsVerifying(false);
            setErrorMessage('Payment was cancelled or dismissed. You can retry paying whenever you are ready.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        setIsSubmitting(false);
        setIsVerifying(false);
        const reason = response.error?.description || response.error?.reason || 'Payment transaction failed.';
        setErrorMessage(`Payment Failed: ${reason}. Please try again or use another payment method.`);
      });

      razorpayInstance.open();

    } catch (error) {
      console.error("Checkout submission error:", error);
      setIsSubmitting(false);
      setIsVerifying(false);
      setErrorMessage(error.message || "There was an error initializing checkout. Please try again.");
    }
  };

  if (!isMounted) return null;

  /* ── SUCCESS SCREEN ── */
  if (isSuccess && orderSummaryResult) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard} style={{ maxWidth: '480px' }}>
          <div className={styles.successIcon}>
            <CheckCircle size={38} />
          </div>
          <h2 className={styles.successTitle}>Payment Successful!</h2>
          <p className={styles.successText}>
            Thank you for your order. Your payment has been securely verified and your order is confirmed.
          </p>

          {/* Receipt Box */}
          <div className={styles.receiptBox}>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Order ID</span>
              <span className={styles.receiptVal}>#{orderSummaryResult.orderId}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Payment ID</span>
              <span className={styles.receiptVal}>{orderSummaryResult.razorpayPaymentId}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Payment Status</span>
              <span className={styles.paidBadge}>
                <Lock size={11} /> Paid via Razorpay
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Date &amp; Time</span>
              <span style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                {new Date(orderSummaryResult.paidAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Total Amount Paid</span>
              <span className={styles.receiptVal} style={{ fontSize: '1rem', color: '#16a34a' }}>
                ₹{orderSummaryResult.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className={styles.successActions}>
            {whatsappLink && (
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                Send Order Confirmation on WhatsApp
              </a>
            )}
            <Link href="/dashboard" className={styles.continueBtn} style={{ background: '#111827', color: '#ffffff' }}>
              View in My Dashboard
            </Link>
            <Link href="/#products" className={styles.continueBtn}>
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
                <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
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
                placeholder="House / Flat No., Apartment, Street, Landmark"
              />
            </div>

            <div className={styles.formGrid3} style={{ marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>PIN / Postal Code <span className={styles.required}>*</span></label>
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

          {/* Payment Method Preview */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Payment Method</div>
            
            <div className={styles.gatewayBadge}>
              <div className={styles.gatewayInfo}>
                <CreditCard className={styles.gatewayIcon} />
                <div>
                  <div className={styles.gatewayTitle}>Razorpay Online Gateway</div>
                  <div className={styles.gatewaySubtitle}>UPI (GPay, PhonePe, Paytm), Cards, NetBanking, Wallets</div>
                </div>
              </div>
              <span className={styles.gatewayTag}>Instant &amp; Secure</span>
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
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}`} className={styles.cartItem}>
                      <img
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                          {item.selectedColor && (
                            <span style={{ fontWeight: 600, color: '#111827' }}>Color: {item.selectedColor}</span>
                          )}
                          {item.selectedColor && item.selectedSize && <span> • </span>}
                          {item.selectedSize && <span>UK {item.selectedSize}</span>}
                        </div>
                        {item.productCode && (
                          <div className={styles.itemSku}>SKU: {item.productCode}</div>
                        )}
                        <div className={styles.itemBottom}>
                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.selectedColor)}
                            >
                              <Minus size={11} />
                            </button>
                            <span className={styles.qtyNum}>{item.quantity}</span>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.selectedColor)}
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
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
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
                  <span className={styles.grandLabel}>Total Amount</span>
                  <span className={styles.grandVal}>₹{totalAmount.toFixed(2)}</span>
                </div>

                {/* Error Callout */}
                {errorMessage && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>{errorMessage}</div>
                  </div>
                )}

                {/* Submit / Pay Button */}
                <form onSubmit={handlePayment}>
                  <button
                    type="submit"
                    disabled={cart.length === 0 || isSubmitting || isVerifying}
                    className={styles.submitBtn}
                  >
                    {isVerifying ? (
                      <><Loader2 size={18} className="animate-spin" /> Verifying Payment...</>
                    ) : isSubmitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Launching Razorpay...</>
                    ) : (
                      <>
                        <Lock size={16} /> Pay Now ₹{totalAmount.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>

                <div className={styles.securityNote}>
                  <ShieldCheck size={14} /> 256-Bit SSL Encrypted &amp; Razorpay Protected
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

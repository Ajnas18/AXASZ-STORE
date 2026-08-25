"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
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
  Lock,
  MapPin,
  FileText,
  Store,
  Clock,
  MessageSquare,
  Zap,
  Check,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { urlFor } from '@/sanity/client';
import styles from './checkout.module.css';

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

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
  const { user } = useAuth();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [selectedOption, setSelectedOption] = useState('pay_now'); // 'pay_now' | 'connect_store'
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderSummaryResult, setOrderSummaryResult] = useState(null);
  const [isConnectStoreSuccess, setIsConnectStoreSuccess] = useState(false);
  const [connectStoreResult, setConnectStoreResult] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    houseBuilding: '',
    streetLocality: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    country: 'India'
  });

  // Policy Consent State
  const [policyConsent, setPolicyConsent] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const [discountCode, setDiscountCode] = useState('');
  const [discountFeedback, setDiscountFeedback] = useState('');

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountFeedback('Please enter a discount code.');
      return;
    }
    setDiscountFeedback('Discounts are not active for this drop.');
    setTimeout(() => {
      setDiscountFeedback('');
    }, 4000);
  };

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

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        houseBuilding: prev.houseBuilding || user.address?.houseBuilding || '',
        streetLocality: prev.streetLocality || user.address?.street || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || '',
        pincode: prev.pincode || user.address?.postalCode || '',
      }));
    }
  }, [user]);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = 0;
  const totalAmount = subtotal - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePolicyChange = (e) => {
    const checked = e.target.checked;
    setPolicyConsent(checked);
    if (checked && errorMessage.includes('policies')) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pinRegex = /^[1-9][0-9]{5}$/;

    // Full Name
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (minimum 2 characters).';
    }

    // Mobile Phone (10 digits Indian or min 10 digits)
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    // Email
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // House / Building Name
    if (!formData.houseBuilding || formData.houseBuilding.trim().length < 1) {
      errors.houseBuilding = 'Please enter house / flat / building name.';
    }

    // Street / Locality
    if (!formData.streetLocality || formData.streetLocality.trim().length < 1) {
      errors.streetLocality = 'Please enter street, area or locality.';
    }

    // City
    if (!formData.city || formData.city.trim().length < 1) {
      errors.city = 'Please enter city.';
    }

    // State
    if (!formData.state || formData.state.trim().length < 1) {
      errors.state = 'Please enter or select state.';
    }

    // Pincode
    const cleanPin = (formData.pincode || '').replace(/\s/g, '');
    if (!cleanPin || !pinRegex.test(cleanPin)) {
      errors.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    setFieldErrors(errors);

    // If address has errors
    if (Object.keys(errors).length > 0) {
      setErrorMessage('Please fill in all required delivery address fields correctly.');
      return false;
    }

    // Policy Consent Check
    if (!policyConsent) {
      setErrorMessage('Please accept the Terms & Conditions and store policies before continuing.');
      return false;
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
      }

      // Name splitting for backward compatibility
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || formData.fullName.trim();
      const lastName = nameParts.slice(1).join(' ') || '';

      const compositeStreetAddress = [
        formData.houseBuilding.trim(),
        formData.streetLocality.trim(),
        formData.landmark ? `Landmark: ${formData.landmark.trim()}` : ''
      ].filter(Boolean).join(', ');

      const payloadFormData = {
        fullName: formData.fullName.trim(),
        firstName,
        lastName,
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        houseBuilding: formData.houseBuilding.trim(),
        streetLocality: formData.streetLocality.trim(),
        streetAddress: compositeStreetAddress,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        postalCode: formData.pincode.trim(),
        landmark: formData.landmark.trim(),
        country: formData.country || 'India'
      };

      const policyConsentAt = new Date().toISOString();
      const policyVersions = {
        terms: '1.0',
        privacy: '1.0',
        cancellation: '1.0',
        refund: '1.0',
        shipping: '1.0'
      };

      // 2. Create store order and Razorpay Order on server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: payloadFormData, 
          cart, 
          subtotal, 
          discount, 
          totalAmount,
          policyConsent: true,
          policyConsentAt,
          policyVersions
        }),
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
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
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
              message += `Name: ${formData.fullName}\n`;
              message += `Phone: ${formData.phone}\n`;
              message += `Email: ${formData.email}\n`;
              message += `Address: ${compositeStreetAddress}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n`;
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

  const handleConnectStore = async (e) => {
    if (e) e.preventDefault();
    setSelectedOption('connect_store');
    setHasAttemptedSubmit(true);
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || formData.fullName.trim();
      const lastName = nameParts.slice(1).join(' ') || '';

      const compositeStreetAddress = [
        formData.houseBuilding.trim(),
        formData.streetLocality.trim(),
        formData.landmark ? `Landmark: ${formData.landmark.trim()}` : ''
      ].filter(Boolean).join(', ');

      const payloadFormData = {
        fullName: formData.fullName.trim(),
        firstName,
        lastName,
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        houseBuilding: formData.houseBuilding.trim(),
        streetLocality: formData.streetLocality.trim(),
        streetAddress: compositeStreetAddress,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        postalCode: formData.pincode.trim(),
        landmark: formData.landmark.trim(),
        country: formData.country || 'India'
      };

      const policyConsentAt = new Date().toISOString();
      const policyVersions = {
        terms: '1.0',
        privacy: '1.0',
        cancellation: '1.0',
        refund: '1.0',
        shipping: '1.0'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actionType: 'connect_store',
          formData: payloadFormData, 
          cart, 
          subtotal, 
          discount, 
          totalAmount,
          policyConsent: true,
          policyConsentAt,
          policyVersions
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order request to store.');
      }

      // Build customer-to-store WhatsApp confirmation URL
      let waUrl = data.adminWhatsappUrl;
      if (!waUrl) {
        const storePhoneNumber = '918943029774';
        let message = `*Order Request Confirmation — AXASZ STORE*\n\n`;
        message += `Hi AXASZ STORE, I have submitted an order request.\n\n`;
        message += `*Order Reference:* #${data.orderId}\n`;
        message += `*Status:* Pending Store Confirmation\n\n`;
        message += `*Customer:* ${formData.fullName}\n`;
        message += `*Phone:* ${formData.phone}\n`;
        message += `*Email:* ${formData.email}\n`;
        message += `*Delivery Address:* ${compositeStreetAddress}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n`;
        message += `*Products:*\n`;
        cart.forEach((item, index) => {
          const colorText = item.selectedColor ? ` - Color: ${item.selectedColor}` : '';
          message += `${index + 1}. ${item.name}${colorText} - Size: UK ${item.selectedSize} - Qty: ${item.quantity} - ₹${item.price}\n`;
        });
        message += `\n*Total:* ₹${totalAmount.toFixed(2)}`;

        const encodedMessage = encodeURIComponent(message);
        waUrl = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;
      }

      setWhatsappLink(waUrl);
      setConnectStoreResult({
        orderId: data.orderId,
        orderDocId: data.orderDocId,
        totalAmount,
        itemCount: cart.length,
        createdAt: new Date().toISOString(),
        customerEmail: formData.email,
      });

      clearCart();
      setIsConnectStoreSuccess(true);

      // Directly redirect to WhatsApp with order details
      if (waUrl) {
        window.location.href = waUrl;
      }
    } catch (error) {
      console.error("Connect Store submission error:", error);
      setErrorMessage(error.message || "There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === 'connect_store') {
      handleConnectStore(e);
    } else {
      handlePayment(e);
    }
  };

  if (!isMounted) return null;

  /* ── SUCCESS SCREEN: PAID ORDER ── */
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

  /* ── SUCCESS SCREEN: CONNECT STORE (PENDING CONFIRMATION) ── */
  if (isConnectStoreSuccess && connectStoreResult) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard} style={{ maxWidth: '500px' }}>
          <div className={styles.pendingIcon}>
            <Clock size={36} />
          </div>
          <h2 className={styles.successTitle}>Order Request Sent!</h2>
          
          <div className={styles.storeNoticeBox}>
            <p className={styles.storeNoticePrimary}>
              Your order request has been sent to the store.
            </p>
            <p className={styles.storeNoticeSecondary}>
              The store will review your order and contact you when it is confirmed.
            </p>
          </div>

          {/* Reference Receipt Box */}
          <div className={styles.receiptBox}>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Order Reference ID</span>
              <span className={styles.receiptVal}>#{connectStoreResult.orderId}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Order Status</span>
              <span className={styles.pendingBadge}>
                <Clock size={11} /> Pending Confirmation
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Payment Status</span>
              <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
                Payment Pending (Post Review)
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Items Requested</span>
              <span className={styles.receiptVal}>{connectStoreResult.itemCount} product(s)</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Estimated Total</span>
              <span className={styles.receiptVal} style={{ fontSize: '1rem', color: '#111827' }}>
                ₹{connectStoreResult.totalAmount.toFixed(2)}
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
                <MessageSquare size={16} /> Chat with Store on WhatsApp
              </a>
            )}
            <Link href="/dashboard" className={styles.continueBtn} style={{ background: '#111827', color: '#ffffff' }}>
              Track in My Dashboard
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
          <img src="/logo.png" alt="AXASZSTORE" className={styles.logoImg} loading="eager" fetchPriority="high" />
        </Link>
      </div>

      <div className={styles.wrapper}>

        {/* ── LEFT: DELIVERY ADDRESS & PAYMENT OPTIONS ── */}
        <div className={styles.leftCol}>
          <h1 className={styles.pageTitle}>Checkout</h1>

          {/* Delivery Address Card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <MapPin size={16} /> Delivery Address
            </div>

            {/* 1. Full Name */}
            <div className={styles.formGroupFull} style={{ marginTop: 0, marginBottom: '1rem' }}>
              <label className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className={`${styles.input} ${fieldErrors.fullName ? styles.inputError : ''}`}
                placeholder="e.g. Sarah Davis"
              />
              {fieldErrors.fullName && <span className={styles.fieldError}>{fieldErrors.fullName}</span>}
            </div>

            {/* 2. Mobile Number & Email */}
            <div className={styles.formGrid2} style={{ marginBottom: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mobile Number <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
                  placeholder="e.g. 9876543210"
                />
                {fieldErrors.phone && <span className={styles.fieldError}>{fieldErrors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                  placeholder="e.g. sarah@example.com"
                />
                {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
              </div>
            </div>

            {/* 3. House / Building Name */}
            <div className={styles.formGroupFull} style={{ marginTop: 0, marginBottom: '1rem' }}>
              <label className={styles.label}>
                House / Building Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="houseBuilding"
                required
                value={formData.houseBuilding}
                onChange={handleInputChange}
                className={`${styles.input} ${fieldErrors.houseBuilding ? styles.inputError : ''}`}
                placeholder="Flat / House No., Apartment Name, Floor"
              />
              {fieldErrors.houseBuilding && <span className={styles.fieldError}>{fieldErrors.houseBuilding}</span>}
            </div>

            {/* 4. Street / Locality */}
            <div className={styles.formGroupFull} style={{ marginTop: 0, marginBottom: '1rem' }}>
              <label className={styles.label}>
                Street / Locality <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="streetLocality"
                required
                value={formData.streetLocality}
                onChange={handleInputChange}
                className={`${styles.input} ${fieldErrors.streetLocality ? styles.inputError : ''}`}
                placeholder="Street Name, Area, Sector, Road"
              />
              {fieldErrors.streetLocality && <span className={styles.fieldError}>{fieldErrors.streetLocality}</span>}
            </div>

            {/* 5. City, State, Pincode */}
            <div className={styles.formGrid3} style={{ marginBottom: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  City <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.city ? styles.inputError : ''}`}
                  placeholder="e.g. Kochi"
                />
                {fieldErrors.city && <span className={styles.fieldError}>{fieldErrors.city}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  State <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  list="indian-states-list"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.state ? styles.inputError : ''}`}
                  placeholder="e.g. Kerala"
                />
                <datalist id="indian-states-list">
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} />
                  ))}
                </datalist>
                {fieldErrors.state && <span className={styles.fieldError}>{fieldErrors.state}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Pincode <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.pincode ? styles.inputError : ''}`}
                  placeholder="e.g. 682001"
                />
                {fieldErrors.pincode && <span className={styles.fieldError}>{fieldErrors.pincode}</span>}
              </div>
            </div>

            {/* 6. Landmark (Optional) */}
            <div className={styles.formGroupFull} style={{ marginTop: 0 }}>
              <label className={styles.label}>
                Landmark <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g. Near Metro Station / Behind City Mall"
              />
            </div>
          </div>

          {/* ── COMPACT PAYMENT / ORDER OPTIONS ── */}
          <div className={styles.optionsSectionCard}>
            <div className={styles.cardHeaderFlex}>
              <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
                <CreditCard size={16} /> Payment &amp; Confirmation Method
              </div>
            </div>

            <div className={styles.compactOptionsList}>
              {/* Option 1 — Pay Online Now */}
              <div 
                className={`${styles.compactOptionRow} ${selectedOption === 'pay_now' ? styles.compactOptionSelected : ''}`}
                onClick={() => setSelectedOption('pay_now')}
                role="button"
                tabIndex={0}
              >
                <div className={styles.compactRadio}>
                  {selectedOption === 'pay_now' && <div className={styles.compactRadioDot} />}
                </div>

                <div className={styles.compactOptionContent}>
                  <div className={styles.compactTitleLine}>
                    <span className={styles.compactTitle}>Pay Online (Razorpay)</span>
                    <span className={styles.optionBadgeFast}>
                      <Zap size={11} className={styles.badgeIcon} /> Instant
                    </span>
                  </div>
                  <div className={styles.compactSubtitle}>
                    UPI (GPay / PhonePe / Paytm), Debit/Credit Cards &amp; NetBanking
                  </div>
                </div>
              </div>

              {/* Option 2 — Connect Store */}
              <div 
                className={`${styles.compactOptionRow} ${selectedOption === 'connect_store' ? styles.compactOptionSelected : ''}`}
                onClick={() => setSelectedOption('connect_store')}
                role="button"
                tabIndex={0}
              >
                <div className={styles.compactRadio}>
                  {selectedOption === 'connect_store' && <div className={styles.compactRadioDot} />}
                </div>

                <div className={styles.compactOptionContent}>
                  <div className={styles.compactTitleLine}>
                    <span className={styles.compactTitle}>Connect Store</span>
                    <span className={styles.optionBadgeAssist}>
                      <MessageSquare size={11} className={styles.badgeIcon} /> Store Review
                    </span>
                  </div>
                  <div className={styles.compactSubtitle}>
                    Confirm shoe size &amp; stock with admin on WhatsApp before payment
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button based on selection */}
            <div className={styles.compactSubmitWrapper}>
              {selectedOption === 'pay_now' ? (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={cart.length === 0 || isSubmitting || isVerifying}
                  className={`${styles.compactSubmitBtn} ${styles.payNowSubmitBtn}`}
                >
                  {isVerifying ? (
                    <><Loader2 size={16} className="animate-spin" /> Verifying Payment...</>
                  ) : isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Launching Razorpay...</>
                  ) : (
                    <><Lock size={15} /> Pay ₹{totalAmount.toFixed(2)} Now</>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectStore}
                  disabled={cart.length === 0 || isSubmitting || isVerifying}
                  className={`${styles.compactSubmitBtn} ${styles.connectStoreSubmitBtn}`}
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting Request...</>
                  ) : (
                    <><Store size={15} /> Connect Store on WhatsApp</>
                  )}
                </button>
              )}
            </div>

            {/* Trust Assurance Bar */}
            <div className={styles.optionsTrustBar}>
              <ShieldCheck size={14} className={styles.trustIcon} />
              <span>100% Genuine Sneakers • 256-Bit SSL Encrypted • Direct WhatsApp Support</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT: ORDER SUMMARY & POLICY CONSENT ── */}
        <div className={styles.rightCol}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>
              <ShoppingBag size={16} /> Order Summary
            </div>

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
                  <button type="button" className={styles.applyBtn} onClick={handleApplyDiscount}>Apply</button>
                </div>
                {discountFeedback && (
                  <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 500 }}>
                    {discountFeedback}
                  </div>
                )}

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

                {/* ── POLICIES & AGREEMENTS SECTION ── */}
                <div 
                  className={`${styles.policiesCard} ${
                    policyConsent ? styles.policiesCardActive : (hasAttemptedSubmit && !policyConsent) ? styles.policiesCardError : ''
                  }`}
                >
                  <div className={styles.policiesHeader}>
                    <FileText size={14} /> Policies &amp; Agreements
                  </div>
                  
                  <label className={styles.policyCheckboxLabel} htmlFor="policy-consent-checkbox">
                    <input
                      id="policy-consent-checkbox"
                      type="checkbox"
                      checked={policyConsent}
                      onChange={handlePolicyChange}
                      className={styles.policyCheckbox}
                    />
                    <span className={styles.policyText}>
                      I agree to the{' '}
                      <Link 
                        href="/terms-and-conditions" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.policyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions
                      </Link>
                      ,{' '}
                      <Link 
                        href="/privacy-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.policyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                      ,{' '}
                      <Link 
                        href="/cancellation-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.policyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Cancellation Policy
                      </Link>
                      ,{' '}
                      <Link 
                        href="/refund-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.policyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Refund Policy
                      </Link>
                      , and{' '}
                      <Link 
                        href="/shipping-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.policyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shipping &amp; Delivery Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {hasAttemptedSubmit && !policyConsent && (
                    <div className={styles.policyWarningText}>
                      <AlertCircle size={13} /> Please accept the store policies to proceed.
                    </div>
                  )}
                </div>

                {/* Error Banner Callout */}
                {errorMessage && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>{errorMessage}</div>
                  </div>
                )}

                {/* Submit Form (Adapts to Selected Option) */}
                <form onSubmit={handleFormSubmit}>
                  <button
                    type="submit"
                    disabled={cart.length === 0 || isSubmitting || isVerifying}
                    className={selectedOption === 'connect_store' ? `${styles.submitBtn} ${styles.connectStoreBtn}` : styles.submitBtn}
                  >
                    {isVerifying ? (
                      <><Loader2 size={18} className="animate-spin" /> Verifying Payment...</>
                    ) : isSubmitting ? (
                      <><Loader2 size={18} className="animate-spin" /> {selectedOption === 'connect_store' ? 'Submitting Request...' : 'Launching Razorpay...'}</>
                    ) : selectedOption === 'connect_store' ? (
                      <>
                        <Store size={16} /> Connect Store
                      </>
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

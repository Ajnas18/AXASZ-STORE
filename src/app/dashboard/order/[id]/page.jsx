"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Lock, 
  Loader2, 
  AlertCircle, 
  MessageSquare,
  Sparkles 
} from 'lucide-react';
import { urlFor } from '@/sanity/client';

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

export default function OrderDetails() {
  const params = useParams();
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        console.error('Failed to fetch order details, status:', res.status);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    setPaymentError('');
    setPaymentSuccessMessage('');

    try {
      // 1. Ensure Razorpay SDK loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Initiate payment session for this exact order ID
      const initRes = await fetch(`/api/orders/${order._id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || 'Failed to initialize payment gateway.');
      }

      if (initData.alreadyPaid) {
        setOrder(prev => ({ ...prev, paymentStatus: 'Paid' }));
        setPaymentSuccessMessage('This order is already verified and marked as Paid.');
        setIsPaying(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, customer } = initData;

      // 3. Open Razorpay modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'AXASZ STORE',
        description: `Order Payment #${order.orderId}`,
        image: '/logo.jpeg',
        order_id: razorpayOrderId,
        prefill: {
          name: customer?.name || order.shippingAddress?.fullName || '',
          email: customer?.email || order.shippingAddress?.email || '',
          contact: customer?.phone || order.shippingAddress?.phone || '',
        },
        theme: {
          color: '#111827',
        },
        handler: async function (paymentResponse) {
          setIsVerifying(true);
          try {
            const verifyRes = await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // Successfully paid! Update state in-place
            setOrder(prev => ({
              ...prev,
              paymentStatus: 'Paid',
              orderStatus: verifyData.orderStatus || 'Confirmed',
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              paidAt: verifyData.paidAt || new Date().toISOString(),
            }));

            setPaymentSuccessMessage('Payment successful! Your order has been securely verified and is confirmed.');
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setPaymentError(verifyErr.message || 'Payment was processed but server verification failed. Please contact support.');
          } finally {
            setIsVerifying(false);
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            setIsVerifying(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setIsPaying(false);
        setIsVerifying(false);
        const reason = response.error?.description || response.error?.reason || 'Payment failed.';
        setPaymentError(`Payment Failed: ${reason}`);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error('Pay Now error:', err);
      setPaymentError(err.message || 'Failed to launch payment. Please try again.');
      setIsPaying(false);
    }
  };

  if (loading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
        <Link href="/dashboard" className="text-black font-medium hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isPendingConfirmation = order.orderStatus === 'Pending Confirmation';
  const isConfirmed = order.orderStatus === 'Confirmed';
  const isUnpaid = order.paymentStatus !== 'Paid';

  // Status timeline definition
  const statusTimeline = isPendingConfirmation
    ? ['Pending Confirmation', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered']
    : ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const currentStatusIndex = statusTimeline.indexOf(order.orderStatus);

  return (
    <div className="w-full">
        
        <button 
          onClick={() => router.push('/dashboard')} 
          style={{ marginTop: '2rem' }}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Orders
        </button>

        {/* ── CONDITIONAL STATUS BANNERS & NOTIFICATIONS ── */}
        {isPendingConfirmation && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                <Clock size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-1">Waiting for store confirmation.</h3>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  Your order request has been received. The store is reviewing your order and will confirm product availability shortly. Once confirmed, you will be able to complete payment directly from here.
                </p>
                <a
                  href={`https://wa.me/918943029774?text=${encodeURIComponent(`Hi AXASZ STORE, following up on my order request #${order.orderId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold hover:bg-amber-950 transition-colors"
                >
                  <MessageSquare size={14} /> Contact Store on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {isConfirmed && isUnpaid && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5 sm:mt-0">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-1">
                    Your order has been confirmed. You can now complete the payment.
                  </h3>
                  <p className="text-sm text-emerald-800">
                    The store team has confirmed stock availability for your order #{order.orderId}.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isPaying || isVerifying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md hover:scale-[1.02] flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : isPaying ? (
                  <><Loader2 size={16} className="animate-spin" /> Launching Razorpay...</>
                ) : (
                  <><Lock size={15} /> Pay Now ₹{order.totalAmount?.toFixed(2)}</>
                )}
              </button>
            </div>
          </div>
        )}

        {paymentSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
            <span>{paymentSuccessMessage}</span>
          </div>
        )}

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  order.orderStatus === 'Pending Confirmation' ? 'bg-amber-100 text-amber-800' :
                  order.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            {order.trackingNumber && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                <p className="font-mono font-medium text-sm">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="mb-12">
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, (Math.max(0, currentStatusIndex) / (statusTimeline.length - 1)) * 100)}%` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {statusTimeline.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] ${
                          isCompleted ? 'bg-black border-black text-white' : 'bg-white border-gray-200'
                        } mb-2 z-10`}>
                          {isCompleted && <CheckCircle size={12} />}
                        </div>
                        <p className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-black font-bold' : 'text-gray-400'}`}>
                          {status}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={16} /> Products Ordered
              </h3>
              <div className="space-y-4">
                {order.products?.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-50 rounded-xl bg-gray-50/50">
                    <div className="w-20 h-20 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={getProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{item.name}</h4>
                      {item.productCode && <p className="text-xs text-gray-500 font-mono mb-1">SKU: {item.productCode}</p>}
                      <p className="text-xs text-gray-500 mb-2">Size: {item.size} • Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">₹{item.price?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={16} /> Shipping Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                  <p className="font-bold text-gray-900 mb-1">
                    {order.shippingAddress?.fullName || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim()}
                  </p>
                  {order.shippingAddress?.houseBuilding && <p>{order.shippingAddress.houseBuilding}</p>}
                  {order.shippingAddress?.streetLocality ? (
                    <p>{order.shippingAddress.streetLocality}</p>
                  ) : (
                    order.shippingAddress?.streetAddress && <p>{order.shippingAddress.streetAddress}</p>
                  )}
                  {order.shippingAddress?.landmark && <p className="text-gray-500 text-xs">Landmark: {order.shippingAddress.landmark}</p>}
                  <p>
                    {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}
                  </p>
                  <p>{order.shippingAddress?.country || 'India'}</p>
                  <p className="mt-2 pt-2 border-t border-gray-200 font-medium text-gray-800">📞 {order.shippingAddress?.phone}</p>
                  <p className="text-gray-600">✉️ {order.shippingAddress?.email}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard size={16} /> Order Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">₹{order.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Discount</span>
                      <span className="font-medium text-gray-900">₹{order.discount?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-black text-gray-900">₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Payment Status</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                      order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                      order.paymentStatus === 'Refunded' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  {order.razorpayPaymentId && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Razorpay Payment ID</span>
                      <span className="font-mono font-medium text-gray-900">{order.razorpayPaymentId}</span>
                    </div>
                  )}

                  {order.paidAt && (
                    <div className="mt-1 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Paid On</span>
                      <span className="text-gray-700">{new Date(order.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                  {/* If Confirmed and Unpaid, also show pay button in summary */}
                  {isConfirmed && isUnpaid && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handlePayNow}
                        disabled={isPaying || isVerifying}
                        className="w-full inline-flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                        ) : isPaying ? (
                          <><Loader2 size={16} className="animate-spin" /> Launching Razorpay...</>
                        ) : (
                          <><Lock size={15} /> Pay Now ₹{order.totalAmount?.toFixed(2)}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

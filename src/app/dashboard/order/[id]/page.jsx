"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { client } from '@/sanity/client';

export default function OrderDetails() {
  const params = useParams();
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

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
      const data = await client.fetch(
        `*[_type == "order" && _id == $id && customer._ref == $customerId][0]`,
        { id, customerId: user.id }
      );
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setOrderLoading(false);
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

  const statusTimeline = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Order #{order.orderId}</h1>
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
                  style={{ width: `${Math.max(0, (currentStatusIndex / (statusTimeline.length - 1)) * 100)}%` }}
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
                        <p className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-black' : 'text-gray-400'}`}>
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
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                  <p className="font-bold text-gray-900 mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p>{order.shippingAddress?.streetAddress}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="mt-2 pt-2 border-t border-gray-200">{order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.email}</p>
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
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Package, User, ChevronRight, ChevronDown, ArrowRight, ShieldCheck, Lock, Truck, RefreshCw, Sparkles } from 'lucide-react';
import DashboardSidebar from '@/components/ui/DashboardSidebar';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Orders');

  const filteredOrders = activeTab === 'All Orders' 
    ? orders 
    : orders.filter(order => order.orderStatus === activeTab);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex justify-center">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-8 lg:gap-10">
          
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Header Section */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 flex-shrink-0">
                <Package size={26} className="text-black" />
              </div>
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Order History</h1>
                <p className="text-[15px] text-gray-500 mt-1">Track and manage all your orders in one place.</p>
              </div>
            </div>

            {/* Filter & Sort Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-1 sm:gap-6 text-[14px] overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-colors shadow-sm border ${
                      activeTab === tab
                        ? 'bg-white text-black border-gray-200'
                        : 'text-gray-400 hover:text-gray-900 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-shrink-0">
                <button className="flex items-center gap-2 text-[14px] text-gray-700 font-medium bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
                  <span>Sort by: <strong>Newest First</strong></span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {ordersLoading ? (
              <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 flex justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center py-28 px-4 text-center">
                <div className="relative mb-6">
                  <div className="w-[88px] h-[88px] bg-gray-50 rounded-full flex items-center justify-center">
                    <Package size={40} className="text-black" />
                  </div>
                  <Sparkles size={20} className="text-gray-300 absolute -top-1 -right-2" />
                  <Sparkles size={16} className="text-gray-300 absolute top-4 -left-4" />
                </div>
                <h3 className="text-[22px] font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-[15px] text-gray-500 mb-8 max-w-[320px]">
                  {activeTab === 'All Orders' 
                    ? 'When you place an order, it will appear here.'
                    : `You have no ${activeTab.toLowerCase()} orders.`}
                </p>
                <Link href="/#products" className="inline-flex items-center gap-2 bg-black px-7 py-3.5 rounded-xl text-[15px] font-semibold !text-white hover:bg-gray-900 hover:scale-[1.02] transition-all shadow-md">
                  <span className="!text-white">Continue Shopping</span>
                  <ArrowRight size={18} className="!text-white" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Link 
                    href={`/dashboard/order/${order._id}`} 
                    key={order._id}
                    className="block bg-white border border-gray-100 rounded-[20px] p-5 sm:p-6 hover:border-gray-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Order #{order.orderId}</p>
                        <p className="text-[15px] font-bold text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 text-[13px] font-bold rounded-lg ${
                          order.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-600' :
                          order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-gray-300 group-hover:text-black transition-colors hidden sm:block bg-gray-50 group-hover:bg-gray-100 p-2 rounded-full">
                          <ChevronRight size={18} />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-t border-b border-gray-50">
                      {order.products?.slice(0, 4).map((item, index) => (
                        <div key={index} className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.products?.length > 4 && (
                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      <p className="text-[14px] font-medium text-gray-500">{order.products?.length || 0} item(s)</p>
                      <p className="text-[18px] font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom Features Banner */}
            <div className="mt-8 bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="flex items-center gap-4">
                  <ShieldCheck size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">100% Authentic</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">Guaranteed authentic products</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Lock size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">Secure Payment</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">Your payment is protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Truck size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">Fast Shipping</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">Quick & reliable delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <RefreshCw size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">Easy Returns</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">Hassle-free returns</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

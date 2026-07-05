"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Package, User, ChevronRight } from 'lucide-react';
import DashboardSidebar from '@/components/ui/DashboardSidebar';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Order History</h1>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 text-sm mb-6">When you place an order, it will appear here.</p>
                  <Link href="/" className="inline-block bg-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors" style={{ color: 'white' }}>
                    continue shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link 
                      href={`/dashboard/order/${order._id}`} 
                      key={order._id}
                      className="block border border-gray-100 rounded-xl p-4 sm:p-6 hover:border-gray-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order #{order.orderId}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(order.orderDate).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className="text-gray-400 group-hover:text-black transition-colors hidden sm:block">
                            <ChevronRight size={20} />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-50">
                        {order.products?.slice(0, 3).map((item, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.products?.length > 3 && (
                          <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">{order.products?.length || 0} item(s)</p>
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

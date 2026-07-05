"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import { MapPin, Plus, Home } from 'lucide-react';

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
                <MapPin size={26} className="text-black" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Addresses</h1>
                  <p className="text-[15px] text-gray-500 mt-1">Manage your shipping and billing addresses.</p>
                </div>
                {user.address && (
                  <button className="hidden sm:flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm">
                    <Plus size={18} />
                    <span>Add New</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 p-8 md:p-10">
              
              {!user.address ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <MapPin size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No address found</h3>
                  <p className="text-[15px] text-gray-500 mb-8 max-w-[320px]">You haven't added any shipping addresses to your profile yet.</p>
                  <button className="flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-900 hover:scale-[1.02] transition-all shadow-md">
                    <Plus size={18} />
                    <span>Add Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Address Card */}
                  <div className="border-2 border-black rounded-[20px] p-6 relative">
                    <div className="absolute top-4 right-4 bg-gray-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Default
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-gray-100 rounded-xl">
                        <Home size={20} className="text-black" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Home</h4>
                    </div>
                    
                    <div className="space-y-1 text-gray-600 text-[15px] leading-relaxed">
                      <p className="font-bold text-black">{user.name}</p>
                      <p>{user.address.street}</p>
                      <p>{user.address.city}, {user.address.state} {user.address.postalCode}</p>
                      <p>{user.address.country}</p>
                      {user.phone && <p className="pt-2">Phone: {user.phone}</p>}
                    </div>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                      <button className="text-[14px] font-bold text-black hover:underline">Edit</button>
                      <button className="text-[14px] font-bold text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

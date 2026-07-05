"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfileDetails() {
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
                <User size={26} className="text-black" />
              </div>
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Profile Details</h1>
                <p className="text-[15px] text-gray-500 mt-1">Manage your personal information and contact details.</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 p-8 md:p-10 space-y-8">
              
              {/* Name */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-[#fafafa] rounded-2xl shadow-sm text-gray-400 border border-gray-100">
                  <User size={24} className="text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-[14px] font-medium text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-[20px] font-bold text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Email */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-[#fafafa] rounded-2xl shadow-sm text-gray-400 border border-gray-100">
                  <Mail size={24} className="text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-[14px] font-medium text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-[20px] font-bold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Phone */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-[#fafafa] rounded-2xl shadow-sm text-gray-400 border border-gray-100">
                  <Phone size={24} className="text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-[14px] font-medium text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-[20px] font-bold text-gray-900">
                    {user.phone ? user.phone : <span className="text-gray-400 italic font-medium text-[16px]">Not provided</span>}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import { User, Mail, Phone } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-36 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Details</h1>

              <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-8">
                
                {/* Name */}
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400">
                    <User size={24} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                    <p className="text-xl font-bold text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200 w-full" />

                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400">
                    <Mail size={24} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="text-xl font-bold text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200 w-full" />

                {/* Phone */}
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400">
                    <Phone size={24} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="text-xl font-bold text-gray-900">
                      {user.phone ? user.phone : <span className="text-gray-400 italic font-medium">Not provided</span>}
                    </p>
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

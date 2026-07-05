"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, MapPin, Heart, LogOut, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-6">
      {/* Navigation Card */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {/* User Profile Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-medium text-gray-800">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-gray-900 text-[15px] truncate">{user.name}</h2>
            <p className="text-[13px] text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
              pathname === '/dashboard' 
                ? 'bg-gray-50 border-l-[3px] border-black text-black' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-black border-l-[3px] border-transparent'
            }`}
          >
            <Package size={20} className={pathname === '/dashboard' ? 'text-black' : 'text-gray-500'} />
            <span className="font-medium text-[15px]">Order History</span>
          </Link>
          
          <Link 
            href="/dashboard/profile" 
            className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
              pathname === '/dashboard/profile' 
                ? 'bg-gray-50 border-l-[3px] border-black text-black' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-black border-l-[3px] border-transparent'
            }`}
          >
            <User size={20} className={pathname === '/dashboard/profile' ? 'text-black' : 'text-gray-500'} />
            <span className="font-medium text-[15px]">Profile Details</span>
          </Link>

          <Link 
            href="/dashboard/addresses" 
            className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
              pathname === '/dashboard/addresses' 
                ? 'bg-gray-50 border-l-[3px] border-black text-black' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-black border-l-[3px] border-transparent'
            }`}
          >
            <MapPin size={20} className={pathname === '/dashboard/addresses' ? 'text-black' : 'text-gray-500'} />
            <span className="font-medium text-[15px]">Addresses</span>
          </Link>

          <Link 
            href="/dashboard/wishlist" 
            className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
              pathname === '/dashboard/wishlist' 
                ? 'bg-gray-50 border-l-[3px] border-black text-black' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-black border-l-[3px] border-transparent'
            }`}
          >
            <Heart size={20} className={pathname === '/dashboard/wishlist' ? 'text-black' : 'text-gray-500'} />
            <span className="font-medium text-[15px]">Wishlist</span>
          </Link>

          <div className="my-2 border-t border-gray-100"></div>

          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-6 py-3.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border-l-[3px] border-transparent"
          >
            <LogOut size={20} className="ml-1" />
            <span className="font-medium text-[15px]">Logout</span>
          </button>
        </nav>
      </div>

      {/* Support Card */}
      <div className="bg-[#fafafa] rounded-[24px] border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <HeadphonesIcon size={24} className="text-black" />
          <div>
            <h3 className="font-medium text-gray-900 text-[15px]">Need help?</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Contact our support team.</p>
          </div>
        </div>
        <Link href="/#contact" className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-800 hover:border-gray-300 transition-colors shadow-sm">
          <span>Contact Support</span>
          <ArrowRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full md:w-72 flex-shrink-0">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sticky top-32">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-gray-900 text-lg truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="space-y-3">
          <Link 
            href="/dashboard" 
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
              pathname === '/dashboard' 
                ? 'bg-black text-white shadow-md transform scale-[1.02]' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={20} className={pathname === '/dashboard' ? 'text-white' : 'text-gray-400'} />
              <span className="font-semibold text-sm">Order History</span>
            </div>
            {pathname === '/dashboard' && <ChevronRight size={18} className="text-white/70" />}
          </Link>
          
          <Link 
            href="/dashboard/profile" 
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
              pathname === '/dashboard/profile' 
                ? 'bg-black text-white shadow-md transform scale-[1.02]' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={20} className={pathname === '/dashboard/profile' ? 'text-white' : 'text-gray-400'} />
              <span className="font-semibold text-sm">Profile Details</span>
            </div>
            {pathname === '/dashboard/profile' && <ChevronRight size={18} className="text-white/70" />}
          </Link>
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm"
          >
            <LogOut size={20} />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

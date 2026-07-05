"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
              pathname === '/dashboard' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} />
              <span className="font-medium text-sm">Order History</span>
            </div>
          </Link>
          <Link 
            href="/dashboard/profile" 
            className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
              pathname === '/dashboard/profile' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={18} />
              <span className="font-medium text-sm">Profile Details</span>
            </div>
          </Link>
          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
}

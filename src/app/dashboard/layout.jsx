"use client";

import React, { useState } from 'react';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#fafafa] overflow-hidden">
      
      {/* Mobile Menu Toggle (Visible only on small screens) */}
      <div className="md:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-md border border-gray-100">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 bg-[#fafafa]
        w-[280px] lg:w-[320px] h-full border-r border-gray-100 overflow-y-auto px-4 py-8 sm:px-6
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DashboardSidebar />
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="h-full px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-12 md:py-16">
          {children}
        </div>
      </div>
      
    </div>
  );
}

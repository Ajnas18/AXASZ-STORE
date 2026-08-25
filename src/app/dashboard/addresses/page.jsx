"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Home, X, Check, Loader2, Trash2, Edit3, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh"
];

export default function AddressesPage() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const openAddModal = () => {
    setFormData({
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'India',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.street || !formData.city || !formData.state || !formData.postalCode) {
      setErrorMsg('Please fill in all required address fields.');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(formData.postalCode.replace(/\s/g, ''))) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      await fetchUser();
      setSuccessMsg('Address saved successfully!');
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/address', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete address');
      }

      await fetchUser();
      setSuccessMsg('Address deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete address');
    } finally {
      setIsSubmitting(false);
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
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 flex-shrink-0">
          <MapPin size={26} className="text-black" />
        </div>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Addresses</h1>
            <p className="text-[15px] text-gray-500 mt-1">Manage your shipping and delivery addresses.</p>
          </div>
          {user.address && (
            <button
              onClick={openAddModal}
              className="hidden sm:flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm cursor-pointer"
            >
              <Edit3 size={16} />
              <span>Edit Address</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex items-center gap-2">
          <Check size={18} className="text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && !isModalOpen && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-gray-100 p-8 md:p-10">
        {!user.address ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No address found</h3>
            <p className="text-[15px] text-gray-500 mb-8 max-w-[320px]">You haven't added any shipping addresses to your profile yet.</p>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-900 hover:scale-[1.02] transition-all shadow-md cursor-pointer"
            >
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
                <h4 className="font-bold text-gray-900 text-lg">Delivery Address</h4>
              </div>

              <div className="space-y-1 text-gray-600 text-[15px] leading-relaxed">
                <p className="font-bold text-black">{user.name}</p>
                <p>{user.address.street}</p>
                <p>{user.address.city}, {user.address.state} - {user.address.postalCode}</p>
                <p>{user.address.country || 'India'}</p>
                {user.phone && <p className="pt-2 text-sm text-gray-700">📞 {user.phone}</p>}
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <button onClick={openAddModal} className="text-[14px] font-bold text-black hover:underline cursor-pointer flex items-center gap-1">
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={handleDelete} className="text-[14px] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {user.address ? 'Edit Shipping Address' : 'Add Shipping Address'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Street / House / Locality *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 4B, Palm Grove, MG Road"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Kochi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    maxLength={6}
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 682001"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    list="state-options"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Kerala"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm transition-all"
                  />
                  <datalist id="state-options">
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

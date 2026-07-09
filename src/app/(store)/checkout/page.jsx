"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  CheckCircle,
  Loader2,
  X,
  Minus,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { urlFor } from '@/sanity/client';

const getProductImageUrl = (image) => {
  if (!image) return '/logo.png';
  if (typeof image === 'string') return image;
  try {
    return urlFor(image).url();
  } catch (e) {
    console.error("Error building image URL:", e);
    return '/logo.png';
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, updateQuantity, removeFromCart } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    country: 'India'
  });

  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = 0; // Dummy discount logic
  const totalAmount = subtotal - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save order to Database
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cart,
          subtotal,
          discount,
          totalAmount
        })
      });

      // 2. Generate WhatsApp Message
      const storePhoneNumber = '918943029774'; 
      
      let message = `*New Order from AXASZ STORE*\n\n`;
      message += `*Customer Details:*\n`;
      message += `Name: ${formData.firstName} ${formData.lastName}\n`;
      message += `Phone: ${formData.phone}\n`;
      message += `Email: ${formData.email}\n`;
      message += `Address: ${formData.streetAddress}, ${formData.city}, ${formData.postalCode}, ${formData.country}\n\n`;
      
      message += `*Order Items:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - Size: ${item.selectedSize} - Qty: ${item.quantity} - ₹${item.price}\n`;
      });
      
      message += `\n*Total Amount:* ₹${totalAmount.toFixed(2)}`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;
      setWhatsappLink(waUrl);

      setIsSuccess(true);
      setIsSubmitting(false);
      clearCart();

      // Automatically open WhatsApp in a new tab
      window.open(waUrl, '_blank');

    } catch (error) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
      alert("There was an error processing your order. Please try again.");
    }
  };

  if (!isMounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Order Placed!</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your order has been saved. Please send the details via WhatsApp to confirm your order and complete payment.
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center w-full bg-[#25D366] text-white font-medium py-3.5 rounded-xl hover:bg-[#128C7E] transition-colors"
            >
              Send Order to WhatsApp
            </a>
            <Link href="/" className="inline-block w-full bg-gray-100 text-gray-800 font-medium py-3.5 rounded-xl hover:bg-gray-200 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 pt-8">
      <div className="max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-10 text-center">
          <Link href="/" className="inline-block mx-auto">
            <img src="/logo.png" alt="AXASZSTORE Logo" className="h-24 w-auto object-contain mx-auto" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Customer & Shipping Details */}
          <div className="w-full lg:w-[55%]">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-5">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Sarah"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Davis"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="mail@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-5">Shipping Details</h2>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="streetAddress"
                  required
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Alpha Plus A-1002, Raiya Telephone Exchange"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="360005"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Rajkot"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <select 
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none transition-all text-gray-700"
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[45%]">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex flex-col">
                
                {cart.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl mb-8">
                    <p className="text-gray-500 text-sm mb-4">Your cart is empty</p>
                    <Link href="/" className="bg-black text-white font-semibold py-3 px-8 rounded-xl hover:bg-gray-900 transition-colors inline-block text-sm">
                      Go Shopping
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 relative group">
                          <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-50">
                            <img src={getProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start pr-6">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                {item.productCode && (
                                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-wider">SKU: {item.productCode}</p>
                                )}
                              </div>
                              <span className="text-sm font-bold text-gray-900">₹{item.price.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex items-center mt-3">
                              <div className="flex items-center bg-gray-50 rounded-md">
                                <button 
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <button 
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="absolute right-0 top-0 text-red-400 hover:text-red-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Discount Code */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Discount Code</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-gray-300 outline-none placeholder:text-gray-400"
                          placeholder="WELCOME123"
                        />
                        <button 
                          type="button"
                          className="px-6 py-3 bg-[#0B132B] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />
                  </>
                )}

                {/* Totals */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Discount</span>
                    <span className="text-gray-900 font-semibold">₹{discount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-black text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>

                <div className="sticky bottom-0 lg:static z-10 mt-6 py-4 lg:py-0 bg-white lg:bg-transparent border-t border-gray-100 lg:border-none">
                  <button 
                    type="submit" 
                    disabled={cart.length === 0 || isSubmitting}
                    style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                    className="w-full flex items-center justify-center gap-2 text-[16px] font-semibold h-[52px] rounded-[8px] border-none transition-all duration-200 ease-in-out hover:opacity-90 active:scale-[0.98] shadow-md disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

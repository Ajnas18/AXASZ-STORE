"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  ShoppingBag, 
  Lock,
  Package
} from 'lucide-react';

const steps = [
  { id: '01', title: "Find Your Grails", icon: Flame, desc: "Browse our premium collection" },
  { id: '02', title: "Cop Your Pair", icon: ShoppingBag, desc: "Add to cart and proceed" },
  { id: '03', title: "Secure Checkout", icon: Lock, desc: "Safe and trusted payments" },
  { id: '04', title: "Unbox & Flex", icon: Package, desc: "Fast shipping to your door" }
];

const StepItem = ({ step, index, isLast }) => {
  const Icon = step.icon;
  return (
    <div className="relative flex flex-col items-center text-center group flex-1 w-full">
      {/* Connecting Line (desktop only) */}
      {!isLast && (
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
          className="hidden md:block absolute top-[50px] left-1/2 w-full h-[1px] bg-gray-200 origin-left z-0"
        />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="flex flex-col items-center w-full z-10"
      >
        <div className="relative mb-6">
          <div className="w-[100px] h-[100px] bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center transition-all duration-500 group-hover:border-black group-hover:shadow-lg z-10 relative">
            <Icon size={28} strokeWidth={1.5} className="text-black transition-transform duration-500 group-hover:scale-110" />
          </div>
          {/* Number badge with cutout effect */}
          <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-bold text-[0.65rem] tracking-wider border-[3px] border-white shadow-sm z-20">
            {step.id}
          </div>
        </div>
        
        <h3 className="font-extrabold text-[0.95rem] tracking-[0.05em] uppercase mb-1.5 transition-colors duration-300 text-black">
          {step.title}
        </h3>
        <p className="text-[0.8rem] text-gray-500 max-w-[180px]">
          {step.desc}
        </p>
      </motion.div>
    </div>
  );
};

export default function HowToOrderSection() {
  return (
    <section id="how-to-order" className="bg-white text-black pt-24 pb-32 px-4 font-sans overflow-hidden flex flex-col items-center w-full">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-xs tracking-[0.25em] font-semibold text-gray-500 uppercase mb-3">Securing Your Sneakers</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          How to Cop
        </h2>
      </motion.div>

      {/* Bulletproof Spacer */}
      <div style={{ height: '100px', width: '100%' }} />

      {/* Steps Container */}
      <div className="max-w-6xl w-full mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8 relative">
          {steps.map((step, index) => (
            <StepItem 
              key={step.id} 
              step={step} 
              index={index} 
              isLast={index === steps.length - 1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function BookingBanner() {
  const scrollToBooking = () => {
    const booking = document.getElementById("booking");
    if (booking) {
      booking.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-transparent">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[50px] glass-card border border-[#C49228]/20 shadow-[0_0_60px_rgba(196,146,40,0.15)] p-12 md:p-20 overflow-hidden"
        >
          {/* Animated Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-green/5 rounded-full blur-[120px] animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                Ready to Experience <br />
                <span className="text-gradient">Elite Healthcare?</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Join thousands of satisfied patients who trust our world-class specialists for their dental health.
              </p>
            </div>
            
            <button
              onClick={scrollToBooking}
              className="btn-premium-primary whitespace-nowrap px-12 py-6 text-xl flex items-center gap-3 group"
            >
              Book Now
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

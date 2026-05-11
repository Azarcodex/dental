"use client";

import React from "react";
import { motion } from "framer-motion";
import { MousePointer2, Calendar, CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Choose Treatment",
    desc: "Select the specific dental service or specialist you need from our elite list.",
    icon: MousePointer2,
  },
  {
    title: "Pick Your Slot",
    desc: "Find a time that perfectly fits your schedule with our live availability system.",
    icon: Calendar,
  },
  {
    title: "Get Confirmed",
    desc: "Receive instant confirmation and your digital token for a priority visit.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section className="pt-32 pb-28 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-subtitle"
          >
            Simple Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Your Path to a <span className="text-gradient">Perfect Smile</span>
          </motion.h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Booking your elite consultation is a simple three-step process designed for your convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-primary-green/20 via-primary-green/20 to-primary-green/20 -translate-y-1/2 z-0" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-primary-green shadow-xl group hover:border-primary-green transition-all duration-500">
                <step.icon size={36} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-navy-950">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
              <div className="md:hidden w-1 h-12 bg-slate-200" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

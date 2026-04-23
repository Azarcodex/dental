"use client";

import { Search, CalendarDays, ClipboardCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your Specialist",
    description: "Search our diverse pool of medical experts by their specialty or name.",
    icon: Search
  },
  {
    number: "02",
    title: "Pick Your Slot",
    description: "Select a date and time that fits your schedule from our live availability calendar.",
    icon: CalendarDays
  },
  {
    number: "03",
    title: "Get Your Token",
    description: "Instantly receive your clinical token number and visit us for your session.",
    icon: ClipboardCheck
  }
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-primary-blue text-white overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-green/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-32 animate-slide-up">
           <span className="section-tag text-primary-green opacity-90 mx-auto">Simplified Booking</span>
           <h2 className="section-title text-white mb-8">Patient Care Made <br /><span className="text-primary-green">Effortless</span></h2>
           <p className="section-desc text-white/50 mx-auto mb-0">Follow three simple steps to secure your medical appointment at ADAMS Poly Clinic.</p>
        </div>

        <div className="relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden lg:block absolute top-[80px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 lg:gap-24 relative">
              {steps.map((step, idx) => (
                <div 
                  key={step.title} 
                  className="flex flex-col items-center text-center space-y-10 group"
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                   <div className="relative">
                      <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-[40px] flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-primary-blue group-hover:scale-110 transition-all duration-700 shadow-2xl group-hover:shadow-white/20">
                         <step.icon size={48} strokeWidth={1} />
                      </div>
                      <div className="absolute -top-3 -right-3 w-14 h-14 bg-primary-green text-white rounded-2xl flex items-center justify-center font-black text-sm border-4 border-primary-blue shadow-xl group-hover:rotate-12 transition-transform">
                         {step.number}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h3 className="text-3xl font-black tracking-tight">{step.title}</h3>
                      <p className="text-lg text-white/60 font-medium leading-relaxed max-w-[320px] mx-auto">{step.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}

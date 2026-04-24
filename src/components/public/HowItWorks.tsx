"use client";

import { Search, CalendarDays, ClipboardCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your Specialist",
    description:
      "Search our diverse pool of medical experts by their specialty or name.",
    icon: Search,
  },
  {
    number: "02",
    title: "Pick Your Slot",
    description:
      "Select a date and time that fits your schedule from our live availability calendar.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Get Your Token",
    description:
      "Instantly receive your clinical token number and visit us for your session.",
    icon: ClipboardCheck,
  },
];

export function HowItWorks() {
  const scrollToBooking = () => {
    const elem = document.getElementById("booking");
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section className="section-padding bg-slate-950 text-white overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-green/8 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-blue/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 animate-slide-up">
          <span className="inline-flex items-center gap-2 bg-primary-green/15 text-primary-green border border-primary-green/20 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6">
            Simplified Booking
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Patient Care Made{" "}
            <span className="text-primary-green">Effortless</span>
          </h2>
          <p className="text-base text-white/45 font-medium leading-relaxed">
            Follow three simple steps to secure your medical appointment at
            ADAMS Poly Clinic.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting dashed line — desktop only */}
          <div
            className="hidden lg:block absolute top-[64px] left-[calc(16.66%+64px)] right-[calc(16.66%+64px)] h-px pointer-events-none"
            aria-hidden="true"
          >
            <svg width="100%" height="2" className="overflow-visible">
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="group flex flex-col items-center text-center"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Icon Block */}
                <div className="relative mb-8">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-[28px] bg-primary-green/10 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon box */}
                  <div className="relative w-32 h-32 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-primary-green/30 group-hover:scale-105 transition-all duration-500">
                    <step.icon
                      size={40}
                      strokeWidth={1.5}
                      className="text-white/60 group-hover:text-primary-green transition-colors duration-500"
                    />
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary-green rounded-2xl flex items-center justify-center font-black text-white text-xs border-4 border-slate-950 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                    {step.number}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-4 max-w-xs">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/45 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector — mobile only between steps */}
                {idx < steps.length - 1 && (
                  <div className="md:hidden mt-8 text-white/20">
                    <ArrowRight size={20} className="rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-white/10" />
            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Ready to get started?
            </span>
            <div className="h-px w-16 bg-white/10" />
          </div>

          <button
            onClick={scrollToBooking}
            className="inline-flex items-center gap-3 bg-primary-green text-white px-10 py-4 rounded-full font-black text-sm shadow-xl shadow-primary-green/20 hover:bg-primary-green-dark hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
          >
            Book Your Appointment
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
            No registration required to book
          </p>
        </div>
      </div>
    </section>
  );
}

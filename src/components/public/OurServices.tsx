"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Stethoscope, 
  Smile, 
  Shield,
  Zap,
  Sparkles,
  HeartPulse,
  Baby
} from "lucide-react";
import { cn } from "@/lib/utils";

const staticServices = [
  { 
    title: "General Dentistry", 
    desc: "Comprehensive routine care, including cleanings and preventive treatments to ensure a lifetime of healthy smiles.", 
    icon: Stethoscope 
  },
  { 
    title: "Oral Surgery", 
    desc: "Expert surgical procedures from wisdom tooth extractions to advanced implants with minimal recovery time.", 
    icon: Zap 
  },
  { 
    title: "Orthodontics", 
    desc: "Achieve the perfect alignment with our state-of-the-art braces and clear aligner (Invisalign) solutions.", 
    icon: Shield 
  },
  { 
    title: "Cosmetic Dentistry", 
    desc: "Transform your smile with premium veneers, professional whitening, and personalized smile makeover plans.", 
    icon: Sparkles 
  },
  { 
    title: "Pediatric Dentistry", 
    desc: "A friendly and gentle environment specialized for the dental health and comfort of our youngest patients.", 
    icon: Baby 
  },
  { 
    title: "Endodontics", 
    desc: "Advanced root canal therapy and specialized care focused on saving your natural teeth with precision.", 
    icon: HeartPulse 
  }
];

function ServiceCard({ service, idx }: { service: any, idx: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      style={{ transitionDelay: `${idx * 100}ms` }}
      className={cn(
        "glass-card p-8 rounded-[32px] transition-all duration-700 group hover:-translate-y-2 hover:border-primary-green/50 hover:bg-white/[0.04]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-green/10 text-primary-green flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-green/20 transition-all duration-500">
        <service.icon size={28} className="drop-shadow-[0_0_10px_rgba(196,146,40,0.5)]" />
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-primary-green transition-colors mb-3">{service.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {service.desc}
      </p>
    </div>
  );
}

export function OurServices() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeaderVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="relative py-24 bg-transparent overflow-hidden">
      <div className="container-custom relative z-10">
        <div 
          ref={headerRef}
          className={cn(
            "max-w-3xl mx-auto text-center mb-16 transition-all duration-1000",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <span className="text-primary-green text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
            Clinical Excellence
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Elite Dental Services
          </h2>
          <div className="w-16 h-1 bg-primary-green mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staticServices.map((service, idx) => (
            <ServiceCard key={service.title} service={service} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

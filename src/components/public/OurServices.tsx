"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
  Stethoscope, 
  Activity, 
  Smile, 
  ArrowRight,
  Shield,
  Zap,
  Star,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  "General Practice": Stethoscope,
  "Cardiology": Activity,
  "Dental Care": Smile,
  "Oral Surgery": Zap,
  "Orthodontics": Shield,
  "Pediatric Dentistry": Star,
};

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
        "bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all duration-700 hover:shadow-xl hover:-translate-y-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-primary-green flex items-center justify-center mb-6">
        <service.icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-navy-950 mb-3">{service.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        {service.desc}
      </p>
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{service.duration || "45 min"}</span>
        </div>
        <button 
          onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
          className="text-xs font-bold uppercase tracking-widest text-primary-green flex items-center gap-2 group"
        >
          Book Now
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export function OurServices() {
  const { data: doctors } = useQuery({
    queryKey: ["public-doctors-services"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    },
  });

  const specializations = Array.from(new Set(doctors?.filter((d: any) => d.status === "ACTIVE").map((d: any) => d.specialization))) as string[];

  const displayServices = specializations.length > 0 
    ? specializations.map(s => ({
        title: s,
        desc: `High-end ${s.toLowerCase()} solutions tailored for your comfort and lasting health.`,
        icon: iconMap[s] || Stethoscope,
        duration: "45 min"
      }))
    : [
        { title: "General Dentistry", desc: "Premium routine care for a lifetime of healthy smiles.", icon: Stethoscope, duration: "30 min" },
        { title: "Oral Surgery", desc: "Expert surgical procedures with minimal recovery time.", icon: Activity, duration: "60 min" },
        { title: "Orthodontics", desc: "State-of-the-art alignment solutions for perfect results.", icon: Smile, duration: "45 min" }
      ];

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
    <section id="services" className="relative py-24 bg-[#f8fafc] overflow-hidden">
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
          <h2 className="text-4xl md:text-5xl font-bold text-navy-950 mb-6">
            Elite Dental Services
          </h2>
          <div className="w-16 h-1 bg-primary-green mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, idx) => (
            <ServiceCard key={service.title} service={service} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

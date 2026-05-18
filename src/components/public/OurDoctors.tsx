"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { User, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function DoctorCard({ doctor, idx }: { doctor: any, idx: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      style={{ transitionDelay: `${idx * 100}ms` }}
      className={cn(
        "glass-card group p-4 rounded-[32px] flex flex-col h-full hover:border-primary-green/50 hover:bg-white/[0.04] transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
      )}
    >
      <div className="relative h-64 w-full rounded-[24px] overflow-hidden mb-6 border border-white/5 group-hover:border-primary-green/30 transition-colors duration-500">
        {doctor.profilePhoto ? (
          <img
            src={doctor.profilePhoto}
            alt={`Dr. ${doctor.firstName}`}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-slate-700">
            <User size={60} />
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-primary-green px-3 py-1 rounded-full shadow-lg">
            {doctor.specialization}
          </span>
        </div>
      </div>

      <div className="px-2 pb-4 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-primary-green transition-colors">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
        </div>
        
        <button 
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("doctorId", doctor.id);
            url.searchParams.set("specialization", doctor.specialization);
            window.history.pushState({}, "", url);
            
            window.dispatchEvent(new CustomEvent("autofill-booking", { 
              detail: { doctorId: doctor.id, specialization: doctor.specialization } 
            }));

            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all duration-500 group-hover:bg-primary-green group-hover:text-black group-hover:border-primary-green flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(196,146,40,0.4)]"
        >
          <Calendar size={16} />
          Book Visit
        </button>
      </div>
    </div>
  );
}

export function OurDoctors() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["public-doctors-redesign"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    },
  });

  const activeDoctors = doctors?.filter((d: any) => d.status === "ACTIVE") || [];

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
    <section id="doctors" className="py-24 bg-transparent overflow-hidden">
      <div className="container-custom">
        <div 
          ref={headerRef}
          className={cn(
            "max-w-3xl mx-auto text-center mb-16 transition-all duration-1000",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <span className="text-primary-green text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
            Expert Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meet Our Specialists
          </h2>
          <div className="w-16 h-1 bg-primary-green mx-auto rounded-full" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 glass-card rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {activeDoctors.map((doctor: any, idx: number) => (
              <DoctorCard key={doctor.id} doctor={doctor} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

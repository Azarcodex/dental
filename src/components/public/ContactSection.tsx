"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export function ContactSection() {
  const { data: contactData } = useQuery({
    queryKey: ["public-contact-info"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const { data } = await axiosInstance.get("/contact");
      return data.data;
    },
  });

  const clinicPhone = contactData?.phone || "+91 98765 43210";
  const clinicEmail = contactData?.email || "care@dentalclinic.com";
  const clinicAddress =
    contactData?.address ||
    "123 Medical Avenue, Health City, Sector 45, India.";

  return (
    <section className="section-padding bg-transparent relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-green-light/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-24 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-12 animate-slide-up">
            <div className="space-y-6">
              <span className="section-subtitle">Direct Support</span>
              <h2 className="section-title">Get In Touch With Our Team</h2>
              <p className="section-desc">
                Our dedicated support staff is available to answer your
                questions and assist with your medical journey.
              </p>
            </div>

            {/* Item: Location */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 bg-white/5 text-primary-green rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-green group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(196,146,40,0.15)] group-hover:shadow-[0_0_30px_rgba(196,146,40,0.4)]">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Location
                </p>
                <p className="text-sm font-black text-white leading-relaxed">
                  {clinicAddress}
                </p>
              </div>
            </div>

            {/* Item: Phone */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 bg-white/5 text-primary-green rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-green group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(196,146,40,0.15)] group-hover:shadow-[0_0_30px_rgba(196,146,40,0.4)]">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Phone
                </p>
                <p className="text-base font-black text-white">
                  {clinicPhone}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  24/7 Available
                </p>
              </div>
            </div>

            {/* Item: Email */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 bg-white/5 text-primary-green rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-green group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(196,146,40,0.15)] group-hover:shadow-[0_0_30px_rgba(196,146,40,0.4)]">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Email
                </p>
                <p className="text-sm font-black text-white break-all">
                  {clinicEmail}
                </p>
              </div>
            </div>
          </div>
          {/* Right: Map */}
          <div className="lg:col-span-7 relative group animate-fade-in">
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#C49228]/30 via-transparent to-[#C49228]/30 rounded-[56px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="h-[500px] lg:h-[700px] glass-card rounded-[48px] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(196,146,40,0.15)] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3906.185940748106!2d75.48358717482033!3d11.751947688462456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba427f6d0243e4b%3A0xa65635b90d0d903!2sZari%20Dental%20Clinic%20Thalassery!5e0!3m2!1sen!2sin!4v1778913353764!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-1000"
              ></iframe>
              {/* Floating badge for branding */}
              <div className="absolute bottom-8 left-8 right-8 lg:left-auto lg:right-8 bg-black/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-2 lg:w-72">
                <p className="text-xs font-black text-primary-green uppercase tracking-[0.2em]">
                  Our Facility
                </p>
                <p className="text-sm font-bold text-white">
                  Visit us for an in-person consultation with our
                  board-certified experts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

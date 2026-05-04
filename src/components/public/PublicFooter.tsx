"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, Camera, Send, MessageCircle, Mail, Phone, MapPin, ExternalLink, Heart } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Subtle Background pattern */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-green/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 relative z-10">
        
        {/* Brand Column */}
        <div className="space-y-10">
           <Link href="/" className="inline-block relative h-12 w-48 bg-white rounded-2xl p-2.5 transition-transform hover:scale-105">
              <Image 
                src="/Main.jpeg" 
                alt="ADAMS Poly Clinic" 
                fill 
                className="object-contain" 
              />
           </Link>
           <p className="text-slate-400 font-medium leading-relaxed">
              Leading the way in medical excellence with a patient-first approach. 
              ADAMS Poly Clinic offers professional healthcare services with international standards.
           </p>
           <div className="flex gap-4">
              {[Globe, Camera, Send, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-primary-green hover:text-white hover:border-primary-green hover:-translate-y-1 transition-all duration-300 group">
                   <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
           </div>
        </div>

        {/* Navigation */}
        <div className="space-y-10">
           <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Quick Navigation</h4>
           <nav className="flex flex-col gap-5 text-slate-400 font-bold">
              <Link href="#home" className="hover:text-primary-green hover:translate-x-1 transition-all duration-300 w-fit">Home</Link>
              <Link href="#about" className="hover:text-primary-green hover:translate-x-1 transition-all duration-300 w-fit">Clinic About</Link>
              <Link href="#services" className="hover:text-primary-green hover:translate-x-1 transition-all duration-300 w-fit">Medical Services</Link>
              <Link href="#doctors" className="hover:text-primary-green hover:translate-x-1 transition-all duration-300 w-fit">Our Specialists</Link>
              <Link href="#booking" className="hover:text-primary-green hover:translate-x-1 transition-all duration-300 w-fit">Book Appointment</Link>
           </nav>
        </div>

        {/* Contact Info */}
        <div className="space-y-10">
           <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Contact & Support</h4>
           <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-primary-green">
                    <MapPin size={18} />
                 </div>
                 <p className="text-slate-400 font-medium text-sm leading-relaxed">
                    123 Medical Avenue, Health City, Sector 45, India.
                 </p>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-primary-green">
                    <Phone size={18} />
                 </div>
                 <p className="text-slate-400 font-medium text-sm">+91 98765 43210</p>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-primary-green">
                    <Mail size={18} />
                 </div>
                 <p className="text-slate-400 font-medium text-sm">support@adamsclinic.com</p>
              </div>
           </div>
        </div>

        {/* Admin Access / Legal */}
        <div className="space-y-10">
           <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Legal & Compliance</h4>
           <div className="flex flex-col gap-4 text-slate-400 font-bold">
              <Link href="#" className="hover:text-primary-green transition-all">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary-green transition-all">Cookies Settings</Link>
              <Link href="#" className="hover:text-primary-green transition-all">Patient Rights</Link>
              <div className="pt-6">
                 <Link href="/admin/login" className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white">
                    Admin Portal <ExternalLink size={14} />
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="container-custom mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
         <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">
            © {currentYear} ADAMS Poly Clinic. All Rights Reserved.
         </p>
         <div className="flex items-center gap-6">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
               Precision Crafted with <Heart size={14} className="text-primary-green fill-primary-green" /> for Wellness
            </p>
         </div>
      </div>
    </footer>
  );
}

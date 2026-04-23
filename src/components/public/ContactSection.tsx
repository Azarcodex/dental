"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-green-light/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-24 items-start">
           
           {/* Left: Contact Info */}
           <div className="lg:col-span-12 xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-12 animate-slide-up">
              <div className="lg:col-span-3 space-y-6 mb-10">
                 <span className="section-tag">Direct Support</span>
                 <h2 className="section-title">Get In Touch With Our Team</h2>
                 <p className="section-desc">
                    Our dedicated support staff is available to answer your questions and assist with your medical journey.
                 </p>
              </div>

              {/* Item: Location */}
              <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-slate-50 text-primary-green rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-green group-hover:text-white transition-all duration-500 shadow-sm">
                    <MapPin size={22} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-black text-slate-950 leading-relaxed">
                       123 Medical Avenue, Health City, Sector 45, India.
                    </p>
                 </div>
              </div>

              {/* Item: Phone */}
              <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-slate-50 text-primary-blue rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-blue group-hover:text-white transition-all duration-500 shadow-sm">
                    <Phone size={22} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-base font-black text-slate-950">+91 98765 43210</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">24/7 Available</p>
                 </div>
              </div>

              {/* Item: Email */}
              <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Mail size={22} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-black text-slate-950 break-all">care@adamsclinic.com</p>
                 </div>
              </div>
           </div>

           {/* Right: Map */}
           <div className="lg:col-span-12 xl:col-span-7 relative group animate-fade-in">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary-green/20 via-transparent to-primary-blue/20 rounded-[56px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="h-[500px] lg:h-[700px] bg-slate-50 rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl relative">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.6067160753047!2d77.0543666755054!3d28.5515206757091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d199736c0d837%3A0xc3f8e6c78e1b6f0!2sDelhi!5e0!3m2!1sen!2sin!4v1713800000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-1000"
                  ></iframe>
                  {/* Floating badge for branding */}
                  <div className="absolute bottom-8 left-8 right-8 lg:left-auto lg:right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-2xl space-y-2 lg:w-72">
                     <p className="text-xs font-black text-primary-green uppercase tracking-[0.2em]">Our Facility</p>
                     <p className="text-sm font-bold text-slate-950">Visit us for an in-person consultation with our board-certified experts.</p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

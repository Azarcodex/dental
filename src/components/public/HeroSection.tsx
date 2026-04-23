"use client";

import { ArrowRight, ShieldCheck, Clock, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const scrollToBooking = () => {
    const elem = document.getElementById("booking");
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="home" className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-primary-green/5 -z-10 rounded-l-[100px] animate-fade-in" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-blue/5 -z-10 rounded-full blur-[100px] animate-fade-in" />
      
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 animate-slide-up">
           <div className="inline-flex items-center gap-2 bg-primary-green/10 text-primary-green px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
              <ShieldCheck size={14} /> PREMIUM MULTISPECIALTY MEDICAL CENTER
           </div>
           
           <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-[1.05] tracking-tight">
              Clinical Excellence <br />
              <span className="text-primary-green">With Compassion.</span>
           </h1>
           
           <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
              Experience world-class medical excellence at ADAMS Poly Clinic. 
              Our expert specialists use state-of-the-art technology to provide 
              personalized care for you and your loved ones.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={scrollToBooking}
                className="w-full sm:w-auto bg-primary-green text-white px-12 py-5 rounded-full font-black text-lg shadow-2xl shadow-primary-green/30 hover:bg-primary-green-dark hover:-translate-y-1.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 group"
              >
                Book Appointment 
                <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-4">
                    {[1,2,3].map((i) => (
                       <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Patient" className="w-full h-full object-cover" />
                       </div>
                    ))}
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-950">10,000+</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Happy Patients</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Visual Block */}
        <div className="hidden lg:grid grid-cols-2 gap-6 relative animate-fade-in">
           <div className="space-y-6 pt-12">
              <div className="card-base p-8 space-y-4 hover:border-primary-green/30 transition-colors">
                 <div className="w-14 h-14 bg-primary-green/10 rounded-2xl flex items-center justify-center text-primary-green">
                    <Clock size={28} />
                 </div>
                 <p className="text-xl font-black text-slate-950">24/7 Response</p>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Always available for emergency and general medical consultation.</p>
              </div>
              <div className="card-base p-8 space-y-4 bg-primary-blue text-white ring-8 ring-primary-blue/5">
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={28} />
                 </div>
                 <p className="text-xl font-black">Secure Care</p>
                 <p className="text-sm text-white/70 font-medium leading-relaxed">Your health data and clinical records are protected with bank-grade security.</p>
              </div>
           </div>
           <div className="space-y-6">
              <div className="card-base p-8 space-y-4 bg-slate-50 border-slate-100">
                 <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue">
                    <Users size={28} />
                 </div>
                 <p className="text-xl font-black text-slate-950">Top Specialists</p>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Consult with internationally certified doctors across all medical departments.</p>
              </div>
              <div className="relative rounded-[40px] overflow-hidden aspect-[4/5] shadow-2xl group">
                 <img 
                   src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" 
                   alt="Medical Care" 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/80 via-transparent to-transparent" />
                 <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white font-black text-lg">World Class Facilities</p>
                    <p className="text-white/70 text-xs font-medium">Equipped with modern diagnostics</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40 hover:opacity-100 transition-opacity cursor-pointer" 
           onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scroll</span>
         <ChevronDown size={20} className="text-slate-400" />
      </div>
    </section>
  );
}

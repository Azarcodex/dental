"use client";

import { ShieldCheck, UserCheck, Microscope, HeartPulse, CheckCircle2, ChevronRight } from "lucide-react";

const reasons = [
  {
    title: "Expert Specialists",
    desc: "Our board-certified medical team brings years of specialized experience to provide you with the highest standard of personalized healthcare.",
    icon: UserCheck,
    color: "bg-primary-blue-light text-primary-blue"
  },
  {
    title: "Advanced Technology",
    desc: "We utilize the latest international diagnostic and treatment technologies to ensure precise results and modern clinical efficiency.",
    icon: Microscope,
    color: "bg-primary-green-light text-primary-green"
  },
  {
    title: "Patient-First Care",
    desc: "Your health journey is our priority. We create customized treatment plans centered around your comfort and complete recovery.",
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-600"
  },
  {
    title: "ISO Certification",
    desc: "As an ISO certified medical facility, we adhere to global safety protocols and clinical quality management standards daily.",
    icon: ShieldCheck,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Emergency Response",
    desc: "Our team is equipped to provide rapid, high-quality emergency medical assistance and stabilization whenever you need it most.",
    icon: CheckCircle2,
    color: "bg-primary-green-light text-primary-green"
  },
  {
    title: "Diagnostic Excellence",
    desc: "Comprehensive lab services and imaging focused on delivering accurate, timely diagnostic insights for better clinical decisions.",
    icon: Microscope,
    color: "bg-primary-blue-light text-primary-blue"
  }
];

export function WhyChooseUs() {
  return (
    <section id="about" className="py-16 lg:py-20 bg-slate-50/30 overflow-hidden">
      <div className="container-custom">
        {/* Centered Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
           <span className="section-tag mx-auto">High Quality Care</span>
           <h2 className="text-4xl lg:text-5xl font-black text-slate-950 mb-6 tracking-tight leading-[1.1]">
              Setting the Standard in <br />
              <span className="text-primary-blue">Modern Healthcare</span>
           </h2>
           <p className="text-base text-slate-500 font-medium leading-relaxed">
             ADAMS Poly Clinic combines compassionate medical attention with cutting-edge 
             technology to ensure the best possible health outcomes for our community.
           </p>
        </div>

        {/* Feature Grid - Increased to 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
           {reasons.map((item, idx) => (
             <div 
               key={item.title} 
               className="group p-8 lg:p-10 rounded-[40px] border border-white bg-white hover:border-primary-green/20 hover:shadow-2xl hover:shadow-primary-green/5 transition-all duration-700 animate-slide-up"
               style={{ animationDelay: `${idx * 100}ms` }}
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-white/50 ${item.color}`}>
                   <item.icon size={32} strokeWidth={2} />
                </div>
                
                <div className="space-y-4">
                   <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                      {item.title}
                   </h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-4">
                      {item.desc}
                   </p>
                   <div className="pt-4 flex items-center gap-2 text-primary-green opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified Standard</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

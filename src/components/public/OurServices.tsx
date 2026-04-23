"use client";

import { 
  Stethoscope, 
  Activity, 
  Smile, 
  Baby, 
  Bone, 
  Brain,
  ArrowRight
} from "lucide-react";

const services = [
  {
    title: "General Practice",
    desc: "Comprehensive primary care services for patients of all ages, focusing on long-term health management.",
    icon: Stethoscope,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Cardiology",
    desc: "Expert care for heart-related conditions using advanced diagnostic tools and personalized treatment.",
    icon: Activity,
    color: "bg-red-50 text-red-600"
  },
  {
    title: "Dental Care",
    desc: "Professional oral health services ranging from routine cleaning to advanced cosmetic procedures.",
    icon: Smile,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Pediatrics",
    desc: "Specialized medical care for infants, children, and adolescents with a gentle, child-friendly approach.",
    icon: Baby,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Orthopedics",
    desc: "Treatment for musculoskeletal issues, focusing on bone, joint, and muscle health and recovery.",
    icon: Bone,
    color: "bg-slate-50 text-slate-600"
  },
  {
    title: "Neurology",
    desc: "Expert diagnosis and management of conditions affecting the nervous system and brain function.",
    icon: Brain,
    color: "bg-indigo-50 text-indigo-600"
  }
];

export function OurServices() {
  return (
    <section id="services" className="py-16 lg:py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
           <span className="section-tag mx-auto">Clinical Excellence</span>
           <h2 className="text-4xl lg:text-5xl font-black text-slate-950 mb-6 tracking-tight leading-[1.1]">
              Specialized Medical <br />
              <span className="text-primary-green">Services for You</span>
           </h2>
           <p className="text-base text-slate-500 font-medium leading-relaxed">
             We offer a wide range of specialized medical services tailored to 
             meet the unique health needs of our diverse patient community.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
           {services.map((service, idx) => (
             <div 
               key={service.title} 
               className="group p-8 lg:p-10 rounded-[40px] border border-slate-50 bg-white hover:border-primary-blue/20 hover:shadow-2xl hover:shadow-primary-blue/5 transition-all duration-700 animate-slide-up"
               style={{ animationDelay: `${idx * 100}ms` }}
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-white/50 ${service.color}`}>
                   <service.icon size={32} strokeWidth={2} />
                </div>
                
                <div className="space-y-4">
                   <h3 className="text-xl font-black text-slate-950 group-hover:text-primary-blue transition-colors">{service.title}</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">{service.desc}</p>
                   <div className="pt-4">
                      <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 group-hover:text-primary-green uppercase tracking-widest transition-all">
                         Find Out More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

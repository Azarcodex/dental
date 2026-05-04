"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aisha Khan",
    role: "Regular Patient",
    text: "The clinical standards at ADAMS Poly Clinic are unmatched. The digital booking was effortless and the staff was extremely professional.",
    avatar: "https://i.pravatar.cc/150?u=12"
  },
  {
    name: "Ravi Sharma",
    role: "Cardiology Patient",
    text: "Truly impressive diagnostic facilities. I visited for a heart checkup and felt completely confident in Dr. Vikram's expertise.",
    avatar: "https://i.pravatar.cc/150?u=22"
  },
  {
    name: "Sarah Joseph",
    role: "Mother of Two",
    text: "The pediatric department is a blessing for our family. The child-friendly environment makes medical visits stress-free.",
    avatar: "https://i.pravatar.cc/150?u=33"
  }
];

export function Testimonials() {
  return (
    <section className="section-padding bg-slate-50/50">
      <div className="container-custom">
        <div className="max-w-3xl mb-16 animate-slide-up">
           <span className="section-tag">Patient Satisfaction</span>
           <h2 className="section-title">Experiences That <br /> Speak for Us</h2>
           <p className="section-desc">
             Read firsthand accounts from patients who have experienced our 
             unwavering commitment to medical excellence and care.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {testimonials.map((t, idx) => (
             <div 
               key={t.name} 
               className="p-10 rounded-[32px] bg-white md:bg-transparent hover:bg-white border border-slate-50 md:border-transparent hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 animate-slide-up relative flex flex-col justify-between group"
               style={{ animationDelay: `${idx * 150}ms` }}
             >
                <div className="absolute top-8 right-8 text-slate-100 group-hover:text-primary-green/10 transition-colors">
                   <Quote className="w-12 h-12 md:w-16 md:h-16" fill="currentColor" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex gap-1 text-amber-400">
                     {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>

                  <p className="text-lg text-slate-600 font-medium leading-relaxed italic">
                     "{t.text}"
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md ring-4 ring-white group-hover:ring-slate-50 transition-all">
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-base font-black text-slate-950">{t.name}</p>
                        <p className="text-[9px] font-black text-primary-green uppercase tracking-widest">{t.role}</p>
                     </div>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { User, Stethoscope, Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function OurDoctors() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["public-doctors"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    }
  });

  return (
    <section id="doctors" className="section-padding bg-slate-50/20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 text-center lg:text-left">
          <div className="max-w-2xl animate-slide-up mx-auto lg:mx-0">
             <span className="section-tag">Medical Experts</span>
             <h2 className="section-title">Professional Specialized Doctors</h2>
             <p className="section-desc">
                Access to highly qualified medical practitioners dedicated to providing 
                comprehensive healthcare and advanced clinical solutions.
             </p>
          </div>
          <div className="flex gap-3 justify-center pb-2">
             <button className="w-12 h-12 bg-white rounded-xl text-slate-300 hover:text-primary-green transition-all shadow-sm flex items-center justify-center group"><ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" /></button>
             <button className="w-12 h-12 bg-white rounded-xl text-slate-300 hover:text-primary-green transition-all shadow-sm flex items-center justify-center group"><ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" /></button>
          </div>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-96 bg-white rounded-3xl animate-pulse" />
              ))}
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {doctors?.filter((d: any) => d.status === "ACTIVE").map((doctor: any, idx: number) => (
                <div 
                  key={doctor.id} 
                  className="group animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                   {/* Clean Image Container - Less Boxy */}
                   <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-slate-100 mb-6 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                      {doctor.profilePhoto ? (
                        <img 
                          src={doctor.profilePhoto} 
                          alt={`${doctor.firstName} ${doctor.lastName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <User size={64} />
                        </div>
                      )}
                      
                      {/* Subtile Spec Tag */}
                      <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                         <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-900 tracking-wider">Expertise</span>
                            <Stethoscope size={14} className="text-primary-green" />
                         </div>
                      </div>
                   </div>
                   
                   {/* Minimal Info */}
                   <div className="px-2 space-y-3">
                      <div>
                         <h3 className="text-lg font-black text-slate-950 group-hover:text-primary-blue transition-colors">Dr. {doctor.firstName} {doctor.lastName}</h3>
                         <p className="text-[10px] font-bold text-primary-green uppercase tracking-widest">{doctor.specialization}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-1 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span className="text-[10px] font-black text-slate-500">Top Rated</span>
                         </div>
                         <button 
                           onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                           className="text-[10px] font-black text-slate-400 hover:text-primary-blue transition-colors uppercase flex items-center gap-1 group/btn"
                         >
                           Book <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </section>
  );
}

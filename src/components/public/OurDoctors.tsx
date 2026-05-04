"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  User,
  Stethoscope,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
  Award,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useState, useRef } from "react";

export function OurDoctors() {
  const [selectedDept, setSelectedDept] = useState("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["public-doctors"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    },
  });

  const activeDoctors =
    doctors?.filter((d: any) => d.status === "ACTIVE") || [];
  const departments = [
    "All",
    ...Array.from(new Set(activeDoctors.map((d: any) => d.department))),
  ];

  const filteredDoctors =
    selectedDept === "All"
      ? activeDoctors
      : activeDoctors.filter((d: any) => d.department === selectedDept);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Adjusted scroll amount to account for card width + gap
      const scrollAmount =
        window.innerWidth < 640 ? window.innerWidth * 0.85 : 344;
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="doctors" className="relative py-20 lg:py-28 bg-slate-50">
      {/* Ambient backgrounds wrapped to allow sticky on parent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-white rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] bg-white rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-14">
          <div className="max-w-2xl animate-slide-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-6">
              <Stethoscope size={16} className="text-primary-blue" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Medical Experts
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              World-Class <br />
              <span className="text-primary-blue">Specialized Doctors</span>
            </h2>
            <p className="text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Access highly qualified medical practitioners dedicated to
              providing comprehensive healthcare through advanced clinical
              solutions.
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-6">
            {/* Glassmorphic Dept Filter Select - Replaced Tabs */}
            <div className="relative group min-w-[200px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue pointer-events-none group-focus-within:scale-110 transition-transform">
                <Filter size={14} />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/50 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer appearance-none"
              >
                {departments.map((dept: any) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : `${dept} Specialists`}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={14} strokeWidth={3} />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll("left")}
                className="w-12 h-12 bg-white/60 backdrop-blur-md border border-white rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm flex items-center justify-center group"
              >
                <ChevronLeft
                  size={22}
                  className="group-hover:-translate-x-1 transition-transform duration-300"
                />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-12 h-12 bg-white/60 backdrop-blur-md border border-white rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm flex items-center justify-center group"
              >
                <ChevronRight
                  size={22}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[85vw] sm:min-w-[320px] h-[480px] bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 -mx-4 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {filteredDoctors.map((doctor: any, idx: number) => (
              <div
                key={doctor.id}
                className="min-w-[75vw] sm:min-w-[240px] max-w-[240px] snap-start group relative p-4 bg-white hover:bg-slate-50 backdrop-blur-xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] flex flex-col h-full"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Top Image Container */}
                <div className="relative h-44 w-full rounded-[1.5rem] overflow-hidden mb-4 bg-slate-100/50">
                  {doctor.profilePhoto ? (
                    <img
                      src={doctor.profilePhoto}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName || ''}`}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-300">
                      <User size={32} />
                    </div>
                  )}

                  {/* Department Floating Badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-slate-100">
                    <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">
                      {doctor.department}
                    </span>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      Dr. {doctor.firstName} {doctor.lastName || ''}
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5 truncate">
                      {doctor.specialization}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() =>
                      document
                        .getElementById("booking")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <Calendar size={12} />
                    Book Consult
                    <ArrowRight
                      size={12}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50">
                <Filter
                  size={48}
                  strokeWidth={1}
                  className="mb-4 text-slate-300"
                />
                <p className="font-semibold text-slate-500">
                  No doctors currently available in this department.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

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
import { useRouter, useSearchParams } from "next/navigation";

export function OurDoctors() {
  const [selectedDept, setSelectedDept] = useState("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["public-doctors"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
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

  const handleBookConsult = (doctor: any) => {
    // Update URL with doctor details for autofill
    const params = new URLSearchParams(searchParams.toString());
    params.set("doctor", doctor.id);
    params.set("specialty", doctor.specialization);
    
    router.push(`?${params.toString()}`, { scroll: false });

    // Smooth scroll to booking section
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = bookingSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
            <div className="relative group min-w-[240px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue pointer-events-none group-focus-within:scale-110 transition-transform">
                <Filter size={14} />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none hover:border-primary-blue/30 focus:border-primary-blue transition-all cursor-pointer appearance-none"
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
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[380px] bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor: any, idx: number) => (
              <div
                key={doctor.id}
                className="group relative p-5 bg-white hover:bg-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-blue/5 transition-all duration-500 rounded-[2.5rem] flex flex-col h-full animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Top Image Container */}
                <div className="relative h-48 w-full rounded-[1.8rem] overflow-hidden mb-5 bg-slate-50">
                  {doctor.profilePhoto ? (
                    <img
                      src={doctor.profilePhoto}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName || ""}`}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center text-slate-200">
                      <User size={40} strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Department Floating Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                      {doctor.department}
                    </span>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-blue transition-colors duration-300">
                      Dr. {doctor.firstName} {doctor.lastName || ""}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em]">
                        {doctor.specialization}
                      </p>
                    </div>
                    {doctor.experience && (
                      <p className="text-xs text-slate-400 font-medium mt-3 line-clamp-2 leading-relaxed">
                        {doctor.experience}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleBookConsult(doctor)}
                    className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-primary-blue text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 group/btn mt-auto shadow-lg shadow-slate-950/10 hover:shadow-primary-blue/30 hover:-translate-y-1 active:scale-95"
                  >
                    <Calendar size={14} />
                    Book Appointment
                    <ArrowRight
                      size={14}
                      className="group-hover/btn:translate-x-1.5 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-[3rem]">
                <Filter
                  size={48}
                  strokeWidth={1}
                  className="mb-4 text-slate-200"
                />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                  No specialists found in this category
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

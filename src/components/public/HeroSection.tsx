"use client";

import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  ChevronDown,
  Star,
  HeartPulse,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const { data: doctorsData } = useQuery({
    queryKey: ["public-doctors-count"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    },
  });

  const activeDoctorsCount = doctorsData 
    ? doctorsData.filter((d: any) => d.status === "ACTIVE").length 
    : 25; // Fallback to 25 if loading or empty

  return (
    <section
      id="home"
      className="relative pt-28 pb-20 lg:pt-44 lg:pb-36 overflow-hidden"
    >
      {/* Background Decor — unchanged */}
      <div
        className="absolute top-0 right-0 w-[40%] h-full bg-primary-green/5 -z-10 rounded-l-[100px] animate-fade-in"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-blue/5 -z-10 rounded-full blur-[100px] animate-fade-in"
        aria-hidden="true"
      />

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* ── LEFT CONTENT ── */}
          <article className="flex flex-col gap-8 animate-slide-up">
            {/* Badge */}
            <span className="self-start inline-flex items-center gap-2 bg-primary-green/10 text-primary-green px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
              <ShieldCheck size={13} />
              Premium Multispecialty Medical Center
            </span>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-950 leading-[1.08] tracking-tight">
                Clinical Excellence
                <br />
                <span className="text-primary-green">With Compassion.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              Experience world-class medical excellence at{" "}
              <span className="text-slate-700 font-bold">
                ADAMS Poly Clinic
              </span>
              . Our expert specialists use state-of-the-art technology to
              provide personalized care for you and your loved ones.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
              {[
                { value: "10K+", label: "Happy Patients" },
                { value: `${activeDoctorsCount}+`, label: "Specialists" },
                { value: "15+", label: "Years of Care" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("booking")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-primary-green text-white px-8 py-4 rounded-full font-black text-base shadow-xl shadow-primary-green/25 hover:bg-primary-green-dark hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
              >
                Book Appointment
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-white text-slate-700 px-8 py-4 rounded-full font-black text-base border border-slate-200 hover:border-primary-green/40 hover:text-primary-green hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            {/* Trust Row */}
            {/* <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/150?u=${i + 20}`}
                    alt="Patient"
                    className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-1">
                    4.9
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Trusted by thousands
                </p>
              </div>
            </div> */}
          </article>

          {/* ── RIGHT VISUAL ── */}
          <div className="hidden lg:flex flex-col gap-5 animate-fade-in">
            {/* Top Row — Image + Stat Card */}
            <div className="grid grid-cols-5 gap-5 items-end">
              {/* Main Image */}
              <figure className="col-span-3 relative rounded-[32px] overflow-hidden aspect-[3/4] shadow-2xl group m-0">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop"
                  alt="World Class Medical Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Floating badge on image */}
                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-green/10 rounded-xl flex items-center justify-center">
                      <HeartPulse size={16} className="text-primary-green" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-950 leading-none">
                        Live Monitoring
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                        Active Care
                      </p>
                    </div>
                  </div>
                </div>

                <figcaption className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-black text-base">
                    World Class Facilities
                  </p>
                  <p className="text-white/60 text-xs font-medium mt-1">
                    Equipped with modern diagnostics
                  </p>
                </figcaption>
              </figure>

              {/* Right Column Cards */}
              <div className="col-span-2 flex flex-col gap-5">
                {/* 24/7 Card */}
                <article className="bg-white rounded-[24px] p-6 space-y-3 border border-slate-100 shadow-sm hover:border-primary-green/30 hover:shadow-md transition-all duration-300">
                  <div className="w-11 h-11 bg-primary-green/10 rounded-2xl flex items-center justify-center text-primary-green">
                    <Clock size={22} />
                  </div>
                  <h3 className="text-sm font-black text-slate-950 leading-snug">
                    24/7 Response
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Always available for emergency and general consultation.
                  </p>
                </article>

                {/* Secure Care Card */}
                <article className="bg-primary-blue rounded-[24px] p-6 space-y-3 shadow-lg shadow-primary-blue/20 ring-4 ring-primary-blue/10">
                  <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="text-sm font-black text-white leading-snug">
                    Secure Care
                  </h3>
                  <p className="text-xs text-white/65 font-medium leading-relaxed">
                    Bank-grade security for all your health records.
                  </p>
                </article>
              </div>
            </div>

            {/* Bottom Row — Wide Specialists Card */}
            <article className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue flex-shrink-0">
                <Users size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-slate-950">
                  Top Specialists
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Consult with internationally certified doctors across all
                  departments.
                </p>
              </div>
              <button
                onClick={() => scrollToSection("doctors")}
                className="flex-shrink-0 bg-primary-blue text-white text-xs font-black px-5 py-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Meet Doctors
              </button>
            </article>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={() => scrollToSection("about")}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 animate-bounce opacity-40 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-0"
        aria-label="Scroll to About Section"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          Scroll
        </span>
        <ChevronDown size={18} className="text-slate-400" />
      </button>
    </section>
  );
}

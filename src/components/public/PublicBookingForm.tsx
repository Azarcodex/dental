"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axios";
import { 
  User, 
  Phone, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  Clock,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { publicBookingSchema, type PublicBookingInput } from "@/lib/validations/publicBooking";
import { cn, formatTimeTo12h } from "@/lib/utils";
import { getLocalDateString } from "@/lib/dateUtils";

const STEPS = [
  { id: 1, title: "Patient" },
  { id: 2, title: "Specialist" },
  { id: 3, title: "Schedule" },
  { id: 4, title: "Confirm" }
];

export function PublicBookingForm() {
  const [step, setStep] = useState(1);
  const [view, setView] = useState<"FORM" | "SUCCESS">("FORM");
  const [successData, setSuccessData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
    mode: "onChange",
    defaultValues: {
      gender: "MALE",
      age: 30, // Default for now as it's required by backend but not in the prompt's UI
    } as any
  });

  const watchSpec = watch("specialization");
  const watchDoctorId = watch("doctorId");
  const watchDate = watch("date");
  const watchSlot = watch("slot");
  const watchFullName = watch("fullName");
  const watchPhone = watch("phone");

  // Queries
  const { data: doctorsData } = useQuery({
    queryKey: ["booking-doctors"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    }
  });

  const specializations = useMemo(() => {
    if (!doctorsData) return [];
    return Array.from(new Set(doctorsData.filter((d: any) => d.status === "ACTIVE").map((d: any) => d.specialization))) as string[];
  }, [doctorsData]);

  const filteredDoctors = useMemo(() => {
    if (!doctorsData || !watchSpec) return [];
    return doctorsData.filter((d: any) => d.specialization === watchSpec && d.status === "ACTIVE");
  }, [doctorsData, watchSpec]);

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["booking-slots", watchDoctorId, watchDate],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/doctors/${watchDoctorId}/slots`, { params: { date: watchDate } });
      return data.slots;
    },
    enabled: !!watchDoctorId && !!watchDate,
  });

  const filteredSlots = useMemo(() => {
    if (!slots) return [];
    const isToday = watchDate === getLocalDateString();
    if (!isToday) return slots;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((s: any) => {
      const [h, m] = s.time.split(":").map(Number);
      return (h * 60 + m) > currentMinutes;
    });
  }, [slots, watchDate]);

  // Mutation
  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.post("/appointments", payload);
    },
    onSuccess: (res) => {
      setSuccessData(res.data.data);
      setView("SUCCESS");
      toast.success("Appointment booked!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["fullName", "gender", "phone", "email"];
    if (step === 2) fieldsToValidate = ["specialization", "doctorId"];
    if (step === 3) fieldsToValidate = ["date", "slot"];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = (data: PublicBookingInput) => {
    bookingMutation.mutate({
      patientData: {
        fullName: data.fullName,
        phone: data.phone,
        gender: data.gender,
        email: data.email,
        age: 30, // Consistent with default
      },
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.slot,
      bookingType: "Online",
    });
  };

  if (view === "SUCCESS" && successData) {
    return (
      <section id="booking" className="pt-32 pb-28 bg-[#f8fafc]">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto glass p-12 rounded-[50px] text-center space-y-8"
          >
            <div className="w-20 h-20 bg-primary-green text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary-green/30">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-navy-950">Appointment Confirmed</h2>
              <p className="text-slate-500 font-medium">Please save your digital token for your visit.</p>
            </div>
            <div className="bg-navy-950 p-10 rounded-[40px] text-white space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Digital Token</span>
              <p className="text-6xl font-black text-gradient">{successData.token}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-6 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                <p className="font-bold text-navy-950">{successData.patient.fullName}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                <p className="font-bold text-navy-950">{formatTimeTo12h(successData.startTime)}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="btn-premium-outline w-full"
            >
              Book Another Appointment
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="pt-32 pb-28 bg-[#f8fafc] overflow-hidden relative">
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-subtitle">Secure Booking</span>
            <h2 className="section-title">Schedule Your Visit</h2>
            <p className="text-slate-500 font-medium">Please fill in your details to reserve your preferred consultation time.</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
            {STEPS.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500",
                  step >= s.id ? "bg-primary-green text-white shadow-lg shadow-primary-green/30 scale-110" : "bg-white text-slate-400 border-2 border-slate-100"
                )}>
                  {s.id}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  step >= s.id ? "text-navy-950" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass rounded-[50px] overflow-hidden shadow-2xl shadow-navy-950/5">
            <div className="bg-navy-950 p-12 text-white flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black">Book Appointment</h3>
                <p className="text-white/40 font-medium mt-2">Complete the steps for your premium consultation.</p>
              </div>
              <div className="hidden md:block">
                <Stethoscope size={48} className="text-primary-green opacity-50" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-12 space-y-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            {...register("fullName")}
                            placeholder="e.g. John Doe"
                            className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950"
                          />
                        </div>
                        {errors.fullName && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.fullName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            {...register("phone")}
                            placeholder="10 digit mobile"
                            className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950"
                          />
                        </div>
                        {errors.phone && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.phone.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Gender</label>
                        <select 
                          {...register("gender")}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950 appearance-none cursor-pointer"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Email (Optional)</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            {...register("email")}
                            placeholder="john@example.com"
                            className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Specialization</label>
                        <select 
                          {...register("specialization")}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950 appearance-none cursor-pointer"
                        >
                          <option value="">Select Treatment...</option>
                          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Doctor</label>
                        <select 
                          {...register("doctorId")}
                          disabled={!watchSpec}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950 appearance-none cursor-pointer disabled:opacity-40"
                        >
                          <option value="">Select Specialist...</option>
                          {filteredDoctors?.map((d: any) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Appointment Date</label>
                      <input 
                        {...register("date")}
                        type="date"
                        min={getLocalDateString()}
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-primary-green focus:bg-white transition-all font-bold text-navy-950"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Available Time Slots</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {slotsLoading ? (
                          <div className="col-span-full py-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary-green" />
                          </div>
                        ) : filteredSlots.length === 0 ? (
                          <div className="col-span-full py-10 text-center text-slate-400 font-bold text-sm">
                            No slots available for this selection.
                          </div>
                        ) : (
                          filteredSlots.map((s: any) => (
                            <button
                              key={s.time}
                              type="button"
                              disabled={!s.available}
                              onClick={() => setValue("slot", s.time, { shouldValidate: true })}
                              className={cn(
                                "py-4 rounded-2xl font-bold text-xs transition-all border-2",
                                watchSlot === s.time 
                                  ? "bg-primary-green border-primary-green text-white shadow-lg" 
                                  : "bg-white border-slate-100 text-navy-950 hover:border-primary-green disabled:opacity-30 disabled:cursor-not-allowed"
                              )}
                            >
                              {formatTimeTo12h(s.time)}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-50 rounded-[30px] space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                        <p className="text-xl font-black text-navy-950">{watchFullName}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[30px] space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-xl font-black text-navy-950">{watchPhone}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[30px] space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</p>
                        <p className="text-xl font-black text-navy-950">
                          {filteredDoctors?.find((d: any) => d.id === watchDoctorId)?.firstName}
                        </p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[30px] space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</p>
                        <p className="text-xl font-black text-navy-950">{watchDate} at {formatTimeTo12h(watchSlot)}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between pt-8 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-navy-950 transition-colors px-6 py-4"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-premium-primary flex items-center gap-2"
                  >
                    Next Step
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="btn-premium-primary flex items-center gap-3"
                  >
                    {bookingMutation.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                    Confirm Booking
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

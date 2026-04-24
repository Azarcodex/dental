"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axios";
import { 
  User, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Stethoscope,
  ClipboardList,
  ArrowRight,
  Mail,
  Check,
  ChevronDown,
  CalendarDays,
  Clock3
} from "lucide-react";
import { cn, formatTimeTo12h } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { publicBookingSchema, type PublicBookingInput } from "@/lib/validations/publicBooking";

// --- Sub-Components ---

const Label = ({ children, required, optional }: { children: React.ReactNode, required?: boolean, optional?: boolean }) => (
  <div className="flex items-center gap-1.5 mb-2.5 ml-1">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">{children}</label>
    {required && <span className="text-primary-green font-bold">*</span>}
    {optional && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>}
  </div>
);

const ErrorMsg = ({ children }: { children?: string }) => (
  children ? <p className="text-[11px] font-semibold text-red-500 mt-2 ml-1 animate-slide-up select-none">{children}</p> : null
);

// --- Main Form Component ---

export function PublicBookingForm() {
  const [view, setView] = useState<"FORM" | "SUCCESS">("FORM");
  const [successData, setSuccessData] = useState<any>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, touchedFields },
  } = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
    mode: "onChange",
    defaultValues: {
      gender: "Male"
    } as any
  });

  const watchSpec = watch("specialization");
  const watchDoctorId = watch("doctorId");
  const watchDate = watch("date");
  const watchSlot = watch("slot");
  const watchPhone = watch("phone");
  const watchEmail = watch("email");

  // --- Queries ---

  const { data: doctorsData } = useQuery({
    queryKey: ["public-doctors-booking"],
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
    queryKey: ["public-slots", watchDoctorId, watchDate],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/doctors/${watchDoctorId}/slots`, { params: { date: watchDate } });
      return data.slots;
    },
    enabled: !!watchDoctorId && !!watchDate,
  });

  // Reset flows
  useEffect(() => {
    if (touchedFields.specialization) {
      setValue("doctorId", "");
      setValue("slot", "");
    }
  }, [watchSpec, setValue, touchedFields.specialization]);

  useEffect(() => {
    setValue("slot", "");
  }, [watchDoctorId, watchDate, setValue]);

  // --- Mutation ---

  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.post("/appointments", payload);
    },
    onSuccess: (response) => {
      setSuccessData(response.data.data);
      setView("SUCCESS");
      toast.success("Appointment Requested!");
      // Immediate scroll to top of success section
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Booking failed.");
    }
  });

  const onSubmit = (data: PublicBookingInput) => {
    setShowErrorSummary(false);
    
    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    bookingMutation.mutate({
      patientData: {
        fullName: data.fullName,
        phone: `+91${data.phone}`,
        gender: data.gender,
        email: data.email,
        age: age,
        bloodGroup: (data as any).bloodGroup
      },
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.slot,
      bookingType: "Online",
    });
  };

  const onInvalid = (errs: any) => {
    setShowErrorSummary(true);
    const errorKeys = Object.keys(errs);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const nameSelector = firstError === "fullName" ? "fullName" : firstError;
      const element = document.getElementsByName(nameSelector)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as any).focus();
      }
    }
  };

  if (view === "SUCCESS" && successData) {
    return (
      <section id="booking" className="section-padding bg-slate-50/30">
        <div className="container-custom">
          <div className="max-w-xl mx-auto bg-white p-10 lg:p-14 rounded-[40px] shadow-xl shadow-primary-blue/5 animate-fade-in text-center space-y-8 relative overflow-hidden">
            <div className="w-20 h-20 bg-primary-green text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-green/20 mx-auto">
               <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-3">
               <h2 className="text-3xl font-black text-slate-950 tracking-tight">Booking Confirmed</h2>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">Your application has been logged. Please present this token at the clinic.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Appointment Token</span>
                  <p className="text-6xl font-black text-primary-blue tracking-tighter">{successData.token}</p>
               </div>
               <div className="space-y-4 pt-6 border-t border-slate-200/60">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Patient</span>
                     <span className="text-sm text-slate-900 font-black">{successData.patient.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Schedule</span>
                     <span className="text-sm text-slate-900 font-black">{formatTimeTo12h(successData.startTime)}</span>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full btn-secondary py-4 rounded-2xl"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="relative py-20 lg:py-28 bg-slate-50/20 scroll-mt-24">
      {/* Ambient Blobs Layer - Moved overflow here to allow sticky on parents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-blue-300/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-emerald-300/10 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8 animate-slide-up lg:sticky lg:top-28 lg:self-start">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-6">
                <CalendarDays size={16} className="text-primary-blue" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Direct Booking</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Schedule Your <br />
                <span className="text-primary-blue">
                  Consultation
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Fast and easy appointment scheduling with our expert medical team. Pick your preferred date and time.
              </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 space-y-4">
                 <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">
                    <Check size={20} />
                 </div>
                 <p className="text-xs font-black text-slate-950">Secure Records</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 space-y-4">
                 <div className="w-10 h-10 bg-primary-green/10 rounded-xl flex items-center justify-center text-primary-green">
                    <Clock3 size={20} />
                 </div>
                 <p className="text-xs font-black text-slate-950">Verified Slots</p>
              </div>
           </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-2xl shadow-primary-blue/5 overflow-hidden animate-fade-in border border-slate-50">
          <div className="bg-slate-950 p-10 lg:p-12 text-white">
             <h3 className="text-2xl font-black mb-2">Patient Details</h3>
             <p className="text-sm text-slate-400 font-medium">Accuracy ensures better care and faster processing.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="p-10 lg:p-12 space-y-12">
            {showErrorSummary && (
              <div className="bg-red-50 p-5 rounded-[24px] border border-red-100 flex items-center gap-3 animate-slide-up">
                 <AlertCircle className="text-red-500" size={24} />
                 <p className="text-sm font-black text-red-600">Kindly address the errors below to confirm your request.</p>
              </div>
            )}

            {/* Information Block: Patient */}
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue font-black text-sm">01</span>
                  <h4 className="text-xl font-black text-slate-950 tracking-tight">Patient Personal Information</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Full Name */}
                  <div className="space-y-1">
                     <Label required>Full Patient Name</Label>
                     <div className="relative">
                        <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.fullName ? "text-red-400" : "text-slate-300")} size={18} />
                        <input 
                          {...register("fullName")}
                          placeholder="e.g. Rahul Sharma"
                          className={cn(
                            "w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14",
                            errors.fullName ? "border-red-500/20 focus:border-red-500 bg-red-50/10 text-red-900" : 
                            touchedFields.fullName && !errors.fullName ? "border-green-500/20 focus:border-green-500 bg-green-50/10 text-slate-800" :
                            "border-slate-100 focus:border-primary-blue focus:bg-white text-slate-800"
                          )}
                        />
                     </div>
                     <ErrorMsg>{errors.fullName?.message}</ErrorMsg>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                     <Label required>Contact Number</Label>
                     <div className="flex group h-14">
                        <div className="px-5 bg-slate-100 border-2 border-r-0 border-slate-100 rounded-l-[22px] text-slate-500 font-black flex items-center justify-center text-sm">
                          +91
                        </div>
                        <div className="relative flex-1">
                           <input 
                             {...register("phone")}
                             type="tel"
                             maxLength={10}
                             placeholder="9876543210"
                             onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.startsWith("91") && val.length > 10) val = val.substring(2);
                                if (val.length > 10) val = val.substring(0, 10);
                                setValue("phone", val, { shouldValidate: true });
                             }}
                             className={cn(
                               "w-full px-5 py-4.5 bg-slate-50 border-2 border-l-0 rounded-r-[22px] outline-none font-bold transition-all text-sm h-14",
                               errors.phone ? "border-red-500/20 focus:border-red-500 bg-red-50/10 text-red-900" :
                               watchPhone?.length === 10 ? "border-green-500/20 focus:border-green-500 bg-green-50/10 text-slate-800" :
                               "border-slate-100 focus:border-primary-blue focus:bg-white text-slate-800"
                             )}
                           />
                           {watchPhone?.length === 10 && (
                             <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary-green animate-fade-in">
                               <CheckCircle2 size={20} />
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="flex justify-between items-center px-1">
                        <ErrorMsg>{errors.phone?.message}</ErrorMsg>
                        <p className={cn("text-[10px] font-black uppercase mt-1.5 transition-colors", watchPhone?.length === 10 ? "text-primary-green" : "text-slate-300")}>
                          {watchPhone?.length || 0} / 10 DIGITS
                        </p>
                     </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                     <Label required>Email Address</Label>
                     <div className="relative">
                        <Mail className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.email ? "text-red-400" : "text-slate-300")} size={18} />
                        <input 
                          {...register("email")}
                          placeholder="e.g. rahul@clinic.com"
                          className={cn(
                            "w-full pl-14 pr-12 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14",
                            errors.email ? "border-red-500/20 focus:border-red-500 bg-red-50/10 text-red-900" : 
                            touchedFields.email && !errors.email ? "border-green-500/20 focus:border-green-500 bg-green-50/10 text-slate-800" :
                            "border-slate-100 focus:border-primary-blue focus:bg-white text-slate-800"
                          )}
                        />
                        {touchedFields.email && !errors.email && watchEmail && (
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary-green animate-fade-in">
                             <Check size={20} />
                          </div>
                        )}
                     </div>
                     <ErrorMsg>{errors.email?.message}</ErrorMsg>
                  </div>

                  {/* DOB */}
                  <div className="space-y-1">
                     <Label required>Date of Birth</Label>
                     <div className="relative h-14">
                        <CalendarDays className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.dob ? "text-red-400" : "text-slate-300")} size={18} />
                        <input 
                          {...register("dob")}
                          type="date"
                          onBlur={() => trigger("dob")}
                          className={cn(
                            "w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14",
                            errors.dob ? "border-red-500/20 focus:border-red-500 bg-red-50/10 text-red-900" : 
                            touchedFields.dob && !errors.dob ? "border-green-500/20 focus:border-green-500 bg-green-50/10 text-slate-800" :
                            "border-slate-100 focus:border-primary-blue focus:bg-white text-slate-800"
                          )}
                        />
                     </div>
                     <ErrorMsg>{errors.dob?.message}</ErrorMsg>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                     <Label required>Gender</Label>
                     <div className="relative h-14">
                        <select 
                          {...register("gender")}
                          className={cn(
                            "w-full px-5 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14 appearance-none hover:border-slate-200 focus:border-primary-blue focus:bg-white cursor-pointer",
                            errors.gender ? "border-red-500/20 focus:border-red-500 text-red-900" : "border-slate-100 text-slate-800"
                          )}
                        >
                           <option value="Male">Male</option>
                           <option value="Female">Female</option>
                           <option value="Other">Other Participant</option>
                           <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-primary-blue transition-colors" size={18} />
                     </div>
                     <ErrorMsg>{errors.gender?.message}</ErrorMsg>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1">
                     <Label optional>Blood Group</Label>
                     <div className="relative h-14 group">
                        <select 
                          {...register("bloodGroup" as any)}
                          className="w-full px-5 py-4.5 bg-slate-50 border-2 border-slate-100 rounded-[22px] outline-none font-bold transition-all text-sm h-14 appearance-none hover:border-slate-200 focus:border-primary-blue focus:bg-white cursor-pointer text-slate-800"
                        >
                           <option value="">Unknown / Not Set</option>
                           <option value="A+">A Positive (A+)</option>
                           <option value="A-">A Negative (A-)</option>
                           <option value="B+">B Positive (B+)</option>
                           <option value="B-">B Negative (B-)</option>
                           <option value="AB+">AB Positive (AB+)</option>
                           <option value="AB-">AB Negative (AB-)</option>
                           <option value="O+">O Positive (O+)</option>
                           <option value="O-">O Negative (O-)</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-primary-blue transition-colors" size={18} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Information Block: Clinical */}
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-primary-green/10 rounded-xl flex items-center justify-center text-primary-green font-black text-sm">02</span>
                  <h4 className="text-xl font-black text-slate-950 tracking-tight">Department & Schedule</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Specialization */}
                  <div className="space-y-1">
                     <Label required>Medical Department</Label>
                     <div className="relative h-14">
                        <Stethoscope className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.specialization ? "text-red-400" : "text-slate-300")} size={18} />
                        <select 
                          {...register("specialization")}
                          className={cn(
                            "w-full pl-14 pr-12 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14 appearance-none hover:border-slate-200 focus:border-primary-green focus:bg-white cursor-pointer",
                            errors.specialization ? "border-red-500/20 focus:border-red-500 text-red-900" : "border-slate-100 text-slate-800"
                          )}
                        >
                           <option value="">Choose Specialty...</option>
                           {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-primary-green transition-colors" size={18} />
                     </div>
                     <ErrorMsg>{errors.specialization?.message}</ErrorMsg>
                  </div>

                  {/* Doctor */}
                  <div className="space-y-1">
                     <Label required>Available Specialist</Label>
                     <div className="relative h-14">
                        <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.doctorId ? "text-red-400" : "text-slate-300")} size={18} />
                        <select 
                          {...register("doctorId")}
                          disabled={!watchSpec}
                          className={cn(
                            "w-full pl-14 pr-12 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14 appearance-none disabled:opacity-40 hover:border-slate-200 focus:border-primary-green focus:bg-white cursor-pointer",
                            errors.doctorId ? "border-red-500/20 focus:border-red-500 text-red-900" : "border-slate-100 text-slate-800"
                          )}
                        >
                           <option value="">{watchSpec ? "Pick Your Doctor..." : "Select specialty first"}</option>
                           {filteredDoctors?.map((d: any) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-primary-green transition-colors" size={18} />
                     </div>
                     <ErrorMsg>{errors.doctorId?.message}</ErrorMsg>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                     <Label required>Visit Date</Label>
                     <div className="relative h-14">
                        <CalendarDays className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300", errors.date ? "text-red-400" : "text-slate-300")} size={18} />
                        <input 
                          {...register("date")}
                          type="date" 
                          min={new Date().toISOString().split("T")[0]}
                          className={cn(
                            "w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 rounded-[22px] outline-none font-bold transition-all text-sm h-14",
                            errors.date ? "border-red-500/20 focus:border-red-500 text-red-900" : "border-slate-100 focus:border-primary-green focus:bg-white text-slate-800"
                          )}
                        />
                     </div>
                     <ErrorMsg>{errors.date?.message}</ErrorMsg>
                  </div>
               </div>

               {/* Slots */}
               <div className="space-y-4 pt-6">
                  <Label required>Choose Time Slot</Label>
                  
                  <div className={cn(
                    "p-8 lg:p-10 rounded-[40px] border-2 transition-all relative min-h-[140px] flex items-center justify-center overflow-hidden",
                    errors.slot ? "bg-red-50 border-red-500/20" : "bg-slate-50/50 border-slate-100"
                  )}>
                     {slotsLoading ? (
                        <div className="flex flex-col items-center gap-4 animate-fade-in">
                           <Loader2 className="animate-spin text-primary-green" size={40} />
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Slots...</p>
                        </div>
                     ) : !watchDoctorId || !watchDate ? (
                        <div className="text-center space-y-4 opacity-30 group">
                           <ClipboardList size={48} className="mx-auto group-hover:scale-110 transition-transform duration-500" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Choose doctor & date <br /> to check availability</p>
                        </div>
                     ) : slots?.length === 0 ? (
                        <div className="text-center space-y-4 animate-fade-in">
                           <AlertCircle size={40} className="mx-auto text-red-300" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-red-400">No appointments available on this date</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full animate-fade-in">
                           {slots?.map((slotObj: { time: string, available: boolean }) => {
                              const isSelected = watchSlot === slotObj.time;
                              const isDisabled = !slotObj.available;
                              return (
                                <button
                                  key={slotObj.time}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setValue("slot", slotObj.time, { shouldValidate: true })}
                                  className={cn(
                                    "h-14 rounded-2xl text-[11px] font-black transition-all border-2 flex items-center justify-center gap-2 relative group-btn",
                                    isSelected
                                      ? "bg-primary-green border-primary-green text-white shadow-xl shadow-primary-green/30 -translate-y-1"
                                      : isDisabled
                                        ? "bg-slate-100/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-40"
                                        : "bg-white border-slate-100 text-primary-blue hover:border-primary-green hover:shadow-lg hover:-translate-y-1"
                                  )}
                                >
                                   {formatTimeTo12h(slotObj.time)}
                                   {isSelected && <Check size={14} strokeWidth={4} />}
                                </button>
                              );
                           })}
                        </div>
                     )}
                  </div>
                  <ErrorMsg>{errors.slot?.message}</ErrorMsg>
               </div>
            </div>

            <button 
              type="submit"
              disabled={bookingMutation.isPending}
              className="w-full btn-primary text-lg h-20 rounded-[30px] flex items-center justify-center gap-4 mt-6 group shadow-2xl shadow-primary-green/40 hover:-translate-y-1.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            >
               {bookingMutation.isPending ? (
                 <Loader2 className="animate-spin" size={28} />
               ) : (
                 <>
                   Confirm Appointment Request
                   <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                 </>
               )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

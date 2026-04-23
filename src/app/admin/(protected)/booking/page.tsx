"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
  User, 
  UserPlus, 
  Search, 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  Printer,
  RotateCcw,
  Phone,
  Mail,
  History
} from "lucide-react";
import { cn, formatTimeTo12h } from "@/lib/utils";
import SlotSelector from "@/components/booking/SlotSelector";
import PatientForm from "@/components/forms/PatientForm";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

// --- Types ---
type Step = 1 | 2 | 3 | 4 | 5;
type PatientType = "NEW" | "RETURNING" | null;

import { getLocalDateString } from "@/lib/dateUtils";

export default function BookingWizard() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  
  // Selection State
  const [patientType, setPatientType] = useState<PatientType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Booking State
  const [specialization, setSpecialization] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(getLocalDateString());
  const [slot, setSlot] = useState("");
  const [bookingType, setBookingType] = useState<"Walk-in" | "Online">("Walk-in");
  const [reason, setReason] = useState("");

  // Final Result State
  const [bookingResult, setBookingResult] = useState<any>(null);

  // --- Queries ---
  
  // Patient Search (Step 2B)
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["patient-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const { data } = await axiosInstance.get("/patient", { params: { query: debouncedSearch } });
      return data.data;
    },
    enabled: patientType === "RETURNING" && debouncedSearch.length >= 2,
  });

  // Doctors & Specs (Step 3)
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    }
  });

  const specializations = useMemo(() => {
    if (!doctorsData) return [];
    return Array.from(new Set(doctorsData.map((d: any) => d.specialization))) as string[];
  }, [doctorsData]);

  const filteredDoctors = useMemo(() => {
    if (!doctorsData || !specialization) return [];
    return doctorsData.filter((d: any) => d.specialization === specialization && d.status === "ACTIVE");
  }, [doctorsData, specialization]);

  // --- Mutations ---
  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.post("/appointments", payload);
    },
    onSuccess: (response) => {
      setBookingResult(response.data.data);
      setStep(5);
      toast.success("Appointment Confirmed!");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Booking failed.");
    }
  });

  // --- Handlers ---
  const handleReset = () => {
    setStep(1);
    setPatientType(null);
    setSearchQuery("");
    setSelectedPatient(null);
    setSpecialization("");
    setDoctorId("");
    setDate(getLocalDateString());
    setSlot("");
    setBookingType("Walk-in");
    setReason("");
    setBookingResult(null);
  };

  const handleConfirm = () => {
    bookingMutation.mutate({
      patientId: selectedPatient.id,
      patientData: {
        fullName: selectedPatient.fullName,
        phone: selectedPatient.phone,
        gender: selectedPatient.gender,
        age: selectedPatient.age,
      },
      doctorId,
      date,
      startTime: slot,
      bookingType,
      reason
    });
  };

  const steps = [
    { id: 1, name: "Patient Type", icon: User },
    { id: 2, name: "Selection", icon: UserPlus },
    { id: 3, name: "Provider", icon: Stethoscope },
    { id: 4, name: "Confirm", icon: ClipboardCheck },
    { id: 5, name: "Success", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header & Step Indicator */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Booking Wizard</h1>
          <p className="text-slate-500 font-medium">Record patient appointments with atomic precision and automated queueing.</p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex items-center justify-center gap-4 px-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                step === s.id 
                  ? "bg-primary-green border-primary-green text-white shadow-xl shadow-primary-green/30 scale-110 z-10" 
                  : step > s.id 
                    ? "bg-primary-green/10 border-primary-green/20 text-primary-green" 
                    : "bg-white border-slate-100 text-slate-300"
              )}>
                <s.icon size={22} strokeWidth={2.5} />
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "hidden md:block w-20 h-0.5 rounded-full transition-colors duration-500",
                  step > i + 1 ? "bg-primary-green" : "bg-slate-100"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 min-h-[500px] flex flex-col relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-green/5 rounded-full -translate-x-1/2 translate-y-1/2 -z-10" />

        {/* STEP 1: PATIENT TYPE */}
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">How should we start?</h2>
              <p className="text-slate-500 font-medium">Select whether this is a first-time registration or a returning case.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
              <button 
                onClick={() => { setPatientType("NEW"); setStep(2); }}
                className="group relative h-64 bg-slate-50 hover:bg-primary-green/5 border-2 border-transparent hover:border-primary-green/20 rounded-[32px] p-8 transition-all flex flex-col items-center justify-center gap-6"
              >
                <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-primary-green shadow-sm group-hover:scale-110 transition-transform">
                  <UserPlus size={40} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">New Patient</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Register a fresh medical record</p>
                </div>
              </button>

              <button 
                onClick={() => { setPatientType("RETURNING"); setStep(2); }}
                className="group relative h-64 bg-slate-50 hover:bg-primary-blue/5 border-2 border-transparent hover:border-primary-blue/20 rounded-[32px] p-8 transition-all flex flex-col items-center justify-center gap-6"
              >
                <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-primary-blue shadow-sm group-hover:scale-110 transition-transform">
                  <User size={40} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">Returning Patient</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Access existing clinical records</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PATIENT SEARCH / FORM */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                {patientType === "NEW" ? "Register New Case" : "Search Patient Record"}
              </h2>
            </div>

            {patientType === "NEW" ? (
              <div className="max-w-2xl mx-auto w-full p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
                 <PatientForm onSuccess={(p) => { setSelectedPatient(p); setStep(3); }} />
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-blue transition-colors" size={24} />
                  <input 
                    autoFocus
                    placeholder="Search by full name or phone number..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue text-lg font-semibold transition-all shadow-inner placeholder:text-gray-400 text-black"
                  />
                  {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-primary-blue" size={24} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto luxe-scrollbar max-h-[400px] p-2">
                  {searchResults?.map((p: any) => {
                    const lastAppointment = p.appointments?.[0];
                    return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={cn(
                        "p-6 rounded-[28px] border-2 text-left transition-all flex flex-col gap-4 relative overflow-hidden group",
                        selectedPatient?.id === p.id 
                          ? "bg-primary-blue/5 border-primary-blue shadow-lg shadow-primary-blue/10" 
                          : "bg-white border-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                          <User size={24} />
                        </div>
                        {selectedPatient?.id === p.id && (
                          <div className="bg-primary-blue text-white p-1 rounded-lg">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-black text-lg">{p.fullName}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="flex items-center gap-1 text-[11px] font-bold text-black uppercase tracking-widest"><Phone size={12} /> {p.phone}</span>
                           <span className="text-slate-200">|</span>
                           <span className="flex items-center gap-1 text-[11px] font-bold text-black uppercase tracking-widest"><History size={12} /> {lastAppointment ? new Date(lastAppointment.date).toLocaleDateString() : "No Records"}</span>
                        </div>
                      </div>
                    </button>
                  )})}
                </div>

                {selectedPatient && (
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => setStep(3)}
                      className="bg-primary-blue text-white px-10 py-4 rounded-[20px] font-bold shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                      Continue to Provider <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DOCTOR & SLOT */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500 flex-1 flex flex-col">
             <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Select Provider & Slot</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                <select 
                  value={specialization} 
                  onChange={(e) => { setSpecialization(e.target.value); setDoctorId(""); }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary-green outline-none font-bold text-slate-800 transition-all shadow-inner"
                >
                  <option value="">Choose Area...</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
               </div>
               <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assign Doctor</label>
                <select 
                  disabled={!specialization}
                  value={doctorId} 
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary-green outline-none font-bold text-slate-800 disabled:opacity-40 transition-all shadow-inner"
                >
                  <option value="">Pick Medical Staff...</option>
                  {filteredDoctors?.map((d: any) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                </select>
               </div>
               <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary-green outline-none font-bold text-slate-800 transition-all shadow-inner"
                />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Booking Type</label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    <button
                      onClick={() => setBookingType("Walk-in")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                        bookingType === "Walk-in" ? "bg-white text-primary-green shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Walk-in
                    </button>
                    <button
                      onClick={() => setBookingType("Online")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                        bookingType === "Online" ? "bg-white text-primary-blue shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Online
                    </button>
                  </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chief Complaint (Optional)</label>
                 <input 
                    type="text" 
                    placeholder="Reason for visit..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green outline-none font-medium text-black placeholder:text-gray-400"
                 />
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <div className="flex items-center gap-2 ml-1">
                  <Clock size={16} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Select Available Window</h3>
               </div>
               <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 flex-1">
                  <SlotSelector 
                    doctorId={doctorId} 
                    date={date} 
                    selectedSlot={slot} 
                    onSelect={(s) => setSlot(s)} 
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chief Complaint (Optional)</label>
               <input 
                  type="text" 
                  placeholder="Reason for visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green outline-none font-medium text-black placeholder:text-gray-400"
               />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                disabled={!slot}
                onClick={() => setStep(4)}
                className="bg-primary-green text-white px-10 py-4 rounded-[20px] font-bold shadow-xl shadow-primary-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Review Booking <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 fade-in duration-500 overflow-y-auto">
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Final Confirmation</h2>
                <p className="text-slate-500 font-medium">Verify clinical details before committing to the schedule.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                 <div className="flex items-center gap-4 border-b border-white pb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-blue shadow-sm">
                       <User size={30} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Profile</p>
                       <p className="text-xl font-bold text-slate-900">{selectedPatient?.fullName}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                      <p className="font-bold text-slate-700 text-sm">{selectedPatient?.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                      <p className="font-bold text-slate-700 text-sm">{selectedPatient?.gender}</p>
                    </div>
                 </div>
               </div>

               <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                 <div className="flex items-center gap-4 border-b border-white pb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-green shadow-sm">
                       <Stethoscope size={30} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Provider Allocation</p>
                       <p className="text-xl font-bold text-slate-900">
                        Dr. {doctorsData?.find((d: any) => d.id === doctorId)?.firstName} {doctorsData?.find((d: any) => d.id === doctorId)?.lastName}
                       </p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="font-bold text-slate-700 text-sm">{date}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Slot</p>
                      <p className="font-bold text-slate-700 text-sm">{formatTimeTo12h(slot)}</p>
                    </div>
                 </div>
               </div>
             </div>

             {reason && (
               <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-100 text-center">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                 <p className="text-slate-700 font-medium">{reason}</p>
               </div>
             )}

             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button 
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-8 py-4 font-bold text-slate-500 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 rounded-2xl"
                >
                  Edit Details
                </button>
                <button 
                  disabled={bookingMutation.isPending}
                  onClick={handleConfirm}
                  className="w-full sm:w-80 bg-primary-green text-white px-10 py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-primary-green/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {bookingMutation.isPending ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={24} />}
                  Confirm Booking
                </button>
             </div>
          </div>
        )}

        {/* STEP 5: SUCCESS & DATA */}
        {step === 5 && bookingResult && (
          <div className="space-y-10 animate-in zoom-in-95 duration-700 py-10">
             <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-primary-green text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-green/40 ring-8 ring-primary-green/10 animate-bounce">
                   <CheckCircle2 size={56} strokeWidth={2.5} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-slate-900">Success!</h2>
                  <p className="text-slate-500 font-medium">Appointment has been successfully recorded in the clinical log.</p>
                </div>

                <div className="relative group perspective-1000">
                   <div className="bg-white border-2 border-primary-green/20 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 min-w-[320px] transform hover:rotate-y-12 transition-transform duration-500">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Token Number</span>
                        <div className="text-7xl font-black text-primary-green tracking-tighter mb-8">{bookingResult.token}</div>
                        
                        <div className="w-full space-y-4 border-t border-slate-100 pt-6">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold">Doctor</span>
                              <span className="text-slate-900 font-black tracking-tight uppercase">Dr. {doctorsData?.find((d: any) => d.id === bookingResult.doctorId)?.lastName}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold">Date</span>
                              <span className="text-slate-900 font-black">{new Date(bookingResult.date).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold">Time</span>
                              <span className="text-slate-900 font-black">{formatTimeTo12h(bookingResult.startTime)}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                   {/* Decorative dots for print effect */}
                   <div className="absolute top-1/2 left-0 w-4 h-8 bg-white border-y border-r border-slate-200 rounded-r-full -translate-x-[2px] -translate-y-1/2" />
                   <div className="absolute top-1/2 right-0 w-4 h-8 bg-white border-y border-l border-slate-200 rounded-l-full translate-x-[2px] -translate-y-1/2" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                   <button 
                     onClick={() => window.print()}
                     className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                   >
                     <Printer size={20} /> Print Receipt
                   </button>
                   <button 
                     onClick={handleReset}
                     className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-primary-green text-primary-green rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-primary-green/5 transition-all"
                   >
                     <RotateCcw size={20} /> Book Another
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
      
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
  UserSquare2, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  Clock, 
  CalendarDays,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Sunrise,
  Sun,
  Sunset,
  Info
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { cn, formatTimeTo12h } from "@/lib/utils";

// --- Types ---
interface Break {
  startTime: string;
  endTime: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName?: string | null;
  specialization: string;
  status: string;
  profilePhoto?: string;
  schedules?: any[];
  blocks?: any[];
}

// --- Helpers ---
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const isInsideRange = (time: string, start: string, end: string) => {
  const t = timeToMinutes(time);
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return t >= s && t < e;
};

export default function SlotManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // --- Configuration State ---
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [manualBlocks, setManualBlocks] = useState<string[]>([]); // Array of startTimes

  // --- Queries ---
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.data;
    },
  });

  const { data: doctorDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["doctor-schedule", selectedDoctorId],
    queryFn: async () => {
      if (!selectedDoctorId) return null;
      const { data } = await axiosInstance.get(`/doctors/${selectedDoctorId}/schedule`);
      return data.data;
    },
    enabled: !!selectedDoctorId,
  });

  // --- Load Existing Config ---
  useEffect(() => {
    if (doctorDetails) {
      const schedules = doctorDetails.schedules || [];
      const blocksArr = doctorDetails.blocks || [];

      if (schedules.length > 0) {
        setActiveDays(schedules.map((s: any) => s.dayOfWeek));
        setStartTime(schedules[0].startTime);
        setEndTime(schedules[0].endTime);
        setSlotDuration(schedules[0].slotDuration);
      } else {
        setActiveDays([]);
        setStartTime("09:00");
        setEndTime("17:00");
        setSlotDuration(30);
      }

      // In this uniform system, blocks might be duplicated across days. 
      // We extract unique time-based blocks as if they are the template.
      const uniqueBlocks = Array.from(new Set(blocksArr.map((b: any) => `${b.startTime}-${b.endTime}`)));
      
      const loadedBreaks: Break[] = [];
      const loadedManualBlocks: string[] = [];

      uniqueBlocks.forEach(bRange => {
        const [s, e] = (bRange as string).split("-");
        // We guess: if range is exactly one slot duration, it was likely a manual block
        // In a real system, we'd have a 'type' field, but we'll use duration as a heuristic here
        const startMin = timeToMinutes(s);
        const endMin = timeToMinutes(e);
        if (endMin - startMin === (schedules[0]?.slotDuration || 30)) {
          loadedManualBlocks.push(s);
        } else {
          loadedBreaks.push({ startTime: s, endTime: e });
        }
      });

      setBreaks(loadedBreaks);
      setManualBlocks(loadedManualBlocks);
    }
  }, [doctorDetails]);

  // --- Calculations ---
  const generatedSlots = useMemo(() => {
    const slots: string[] = [];
    let current = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (current >= end) return [];

    while (current + slotDuration <= end) {
      slots.push(minutesToTime(current));
      current += slotDuration;
    }
    return slots;
  }, [startTime, endTime, slotDuration]);
  
  const groupedSlots = useMemo(() => {
    const groups = {
      morning: [] as string[],
      afternoon: [] as string[],
      evening: [] as string[],
    };

    generatedSlots.forEach(slot => {
      const hour = parseInt(slot.split(":")[0]);
      if (hour < 12) groups.morning.push(slot);
      else if (hour < 17) groups.afternoon.push(slot);
      else groups.evening.push(slot);
    });

    return groups;
  }, [generatedSlots]);

  const filteredDoctors = doctors?.filter((d: any) => 
    `${d.firstName} ${d.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDoctor = doctors?.find((d: any) => d.id === selectedDoctorId);

  // --- Handlers ---
  const handleToggleDay = (dayIndex: number) => {
    setActiveDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { startTime: "12:00", endTime: "13:00" }]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleUpdateBreak = (index: number, key: keyof Break, value: string) => {
    const newBreaks = [...breaks];
    newBreaks[index][key] = value;
    setBreaks(newBreaks);
  };

  const handleToggleSlot = (slotTime: string) => {
    setManualBlocks(prev => 
      prev.includes(slotTime) ? prev.filter(t => t !== slotTime) : [...prev, slotTime]
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allBlocks = [
        ...breaks,
        ...manualBlocks.map(t => ({
          startTime: t,
          endTime: minutesToTime(timeToMinutes(t) + slotDuration)
        }))
      ];

      return axiosInstance.post(`/doctors/${selectedDoctorId}/schedule`, {
        days: activeDays,
        startTime,
        endTime,
        slotDuration,
        blocks: allBlocks
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedule", selectedDoctorId] });
      toast.success("Schedule saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save schedule.");
    }
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 overflow-hidden">
      
      {/* LEFT: DOCTOR SELECTION */}
      <div className="w-full lg:w-[350px] bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Medical Staff</h2>
          <div className="relative group px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input 
              placeholder="Search doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 luxe-scrollbar">
          {loadingDoctors ? (
             [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)
          ) : filteredDoctors?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                <Search size={20} />
              </div>
              <p className="text-sm font-bold text-slate-400">No doctors found</p>
            </div>
          ) : filteredDoctors?.map((doctor: any) => (
            <div 
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4",
                selectedDoctorId === doctor.id 
                  ? "bg-primary-green/5 border-primary-green shadow-sm ring-1 ring-primary-green/20" 
                  : "bg-white border-transparent hover:bg-slate-50/50"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-slate-100">
                  {doctor.profilePhoto ? (
                    <img src={doctor.profilePhoto} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><UserSquare2 size={24} /></div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                  doctor.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">Dr. {doctor.firstName} {doctor.lastName || ''}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{doctor.specialization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: SLOT MANAGEMENT */}
      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {!selectedDoctorId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-300">
              <CalendarDays size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Select a Doctor</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1 font-medium">Please select a medical professional from the left panel to configure their clinical availability.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="px-8 py-6 bg-slate-50/30 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue">
                   <Clock size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName || ''}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black text-primary-blue bg-primary-blue/5 border border-primary-blue/10 px-2 py-0.5 rounded-md uppercase tracking-[0.1em]">{selectedDoctor?.specialization}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• Availability Manager</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || activeDays.length === 0}
                className="flex items-center gap-2 bg-primary-green hover:bg-primary-green-dark text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-green/20 disabled:opacity-50 active:scale-95"
              >
                {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 luxe-scrollbar">
              
              {/* SECTION 1: WORKING DAYS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-primary-blue" />
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">Weekly Clinical Cycle</h3>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                    {activeDays.length} Days Selected
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-[28px] border border-slate-100">
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                    {DAYS.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => handleToggleDay(index)}
                        className={cn(
                          "py-4 rounded-2xl text-[12px] font-black transition-all border flex flex-col items-center gap-1",
                          activeDays.includes(index)
                            ? "bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/20 scale-[1.02]"
                            : "bg-white border-gray-100 text-slate-400 hover:border-primary-blue/30 hover:text-slate-600"
                        )}
                      >
                        <span className="opacity-50">{day.substring(0, 3)}</span>
                        <span>{day.substring(0, 1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 2: SHIFT TIMINGS */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Clock size={18} className="text-primary-blue" />
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">Shift & Session Config</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full translate-x-1/2 -translate-y-1/2 -z-10 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Start</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-black text-slate-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily End</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-black text-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Size (Min)</label>
                    <select 
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-black text-slate-900 transition-all appearance-none"
                    >
                      {[15, 20, 30, 45, 60, 90, 120].map(v => (
                        <option key={v} value={v}>{v} Minutes</option>
                      ))}
                    </select>
                  </div>
                </div>
                {generatedSlots.length > 0 && (
                  <div className="flex items-center gap-3 bg-primary-green/5 border border-primary-green/10 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-green flex items-center justify-center text-white shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                      Generating <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-100 mx-1">{generatedSlots.length} sessions</span> every clinical day from <span className="font-black text-slate-900">{formatTimeTo12h(startTime)}</span> to <span className="font-black text-slate-900">{formatTimeTo12h(endTime)}</span>.
                    </p>
                  </div>
                )}
              </section>

              {/* SECTION 4: BREAK TIMES */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-primary-blue" />
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">Clinical Session Breaks</h3>
                  </div>
                  <button 
                    onClick={handleAddBreak}
                    className="group px-4 py-2 bg-primary-blue/5 hover:bg-primary-blue text-primary-blue hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Session Break
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {breaks.map((br, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-100 group animate-in slide-in-from-left-2 shadow-sm hover:border-primary-blue/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                         <Clock size={20} />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">From</p>
                          <input 
                            type="time" 
                            value={br.startTime}
                            onChange={(e) => handleUpdateBreak(index, "startTime", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-blue outline-none text-xs font-black text-slate-900 transition-all"
                          />
                        </div>
                        <div className="w-4 h-0.5 bg-slate-100 mt-5" />
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Until</p>
                          <input 
                            type="time" 
                            value={br.endTime}
                            onChange={(e) => handleUpdateBreak(index, "endTime", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-blue outline-none text-xs font-black text-slate-900 transition-all"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveBreak(index)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mt-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {breaks.length === 0 && (
                    <div className="sm:col-span-2 p-10 border-2 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/30">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 shadow-sm">
                        <ShieldAlert size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Breaks</p>
                      <p className="text-[10px] text-slate-400 mt-1">Add breaks to block time for lunch or clinical meetings.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 3: GENERATED SLOTS PREVIEW */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Sunrise size={18} className="text-primary-blue" />
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">Live Session Grid & Blocking</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blocked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Break</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 space-y-10">
                  {/* GROUP: MORNING */}
                  {groupedSlots.morning.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
                        <Sunrise size={16} className="text-orange-400" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Morning Sessions</h4>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {groupedSlots.morning.map(slot => (
                          <SlotButton 
                            key={slot}
                            slot={slot}
                            breaks={breaks}
                            manualBlocks={manualBlocks}
                            handleToggleSlot={handleToggleSlot}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GROUP: AFTERNOON */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
                        <Sun size={16} className="text-blue-400" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Afternoon Sessions</h4>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {groupedSlots.afternoon.map(slot => (
                          <SlotButton 
                            key={slot}
                            slot={slot}
                            breaks={breaks}
                            manualBlocks={manualBlocks}
                            handleToggleSlot={handleToggleSlot}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GROUP: EVENING */}
                  {groupedSlots.evening.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
                        <Sunset size={16} className="text-indigo-400" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evening Sessions</h4>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {groupedSlots.evening.map(slot => (
                          <SlotButton 
                            key={slot}
                            slot={slot}
                            breaks={breaks}
                            manualBlocks={manualBlocks}
                            handleToggleSlot={handleToggleSlot}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedSlots.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
                        <Info size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">No Slots Generated</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Adjust start and end times to generate clinical windows.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function SlotButton({ slot, breaks, manualBlocks, handleToggleSlot }: { 
  slot: string; 
  breaks: Break[]; 
  manualBlocks: string[]; 
  handleToggleSlot: (s: string) => void;
}) {
  const isBreak = breaks.some(br => isInsideRange(slot, br.startTime, br.endTime));
  const isBlocked = manualBlocks.includes(slot);

  return (
    <button
      onClick={() => !isBreak && handleToggleSlot(slot)}
      disabled={isBreak}
      className={cn(
        "py-3.5 rounded-2xl text-[10px] font-black transition-all border shadow-sm relative group overflow-hidden",
        isBreak 
          ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-60" 
          : isBlocked 
            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20 ring-4 ring-red-500/10 scale-[1.02]" 
            : "bg-white border-slate-200 text-slate-900 hover:border-primary-green hover:text-primary-green hover:scale-[1.05] hover:shadow-md hover:z-10"
      )}
    >
      {formatTimeTo12h(slot)}
      {isBreak && (
        <span className="absolute inset-0 flex items-center justify-center bg-slate-100/40 text-[7px] font-black text-slate-400 uppercase tracking-tighter mix-blend-multiply">
          BREAK
        </span>
      )}
      {!isBreak && !isBlocked && (
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-primary-green opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

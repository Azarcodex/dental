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
  CheckCircle2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// --- Types ---
interface Break {
  startTime: string;
  endTime: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
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

  const filteredDoctors = doctors?.filter((d: any) => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 luxe-scrollbar">
          {loadingDoctors ? (
             [1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)
          ) : filteredDoctors?.map((doctor: any) => (
            <div 
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4",
                selectedDoctorId === doctor.id 
                  ? "bg-primary-green/5 border-primary-green shadow-sm ring-1 ring-primary-green/20" 
                  : "bg-white border-gray-100 hover:border-primary-green/30 hover:bg-slate-50/50"
              )}
            >
              <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-slate-100 shrink-0">
                {doctor.profilePhoto ? (
                  <img src={doctor.profilePhoto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><UserSquare2 size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">Dr. {doctor.firstName} {doctor.lastName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{doctor.specialization}</span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    doctor.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"
                  )} />
                </div>
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
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-primary-blue bg-primary-blue/5 border border-primary-blue/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{selectedDoctor?.specialization}</span>
                  <span className="text-xs font-medium text-slate-400">• Availability Manager</span>
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
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">1. Clinical Working Days</h3>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleToggleDay(index)}
                      className={cn(
                        "py-3 rounded-2xl text-[13px] font-bold transition-all border",
                        activeDays.includes(index)
                          ? "bg-primary-blue border-primary-blue text-white shadow-md shadow-primary-blue/20"
                          : "bg-white border-gray-100 text-slate-400 hover:border-primary-blue/30"
                      )}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </section>

              {/* SECTION 2: SHIFT TIMINGS */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">2. Shift & Session Timings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[28px] border border-slate-100 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Start Time</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">End Time</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Slot Duration (Min)</label>
                    <input 
                      type="number" 
                      value={slotDuration}
                      min={5}
                      step={5}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none font-bold text-slate-900"
                    />
                  </div>
                </div>
                {generatedSlots.length > 0 && (
                  <p className="text-[13px] text-slate-500 flex items-center gap-2 ml-1">
                    <CheckCircle2 size={14} className="text-primary-green" />
                    Slots from <span className="font-bold text-slate-900">{startTime}</span> to <span className="font-bold text-slate-900">{endTime}</span> every <span className="font-bold text-slate-900">{slotDuration} mins</span> generate <span className="font-black text-primary-blue bg-primary-blue/5 px-2 py-0.5 rounded-lg">{generatedSlots.length} sessions</span>.
                  </p>
                )}
              </section>

              {/* SECTION 4: BREAK TIMES */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">3. Scheduled Breaks</h3>
                  </div>
                  <button 
                    onClick={handleAddBreak}
                    className="text-xs font-bold text-primary-blue flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Session Break
                  </button>
                </div>
                
                <div className="space-y-3">
                  {breaks.map((br, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 group animate-in slide-in-from-left-2">
                      <div className="flex-1 flex items-center gap-3 w-full">
                        <input 
                          type="time" 
                          value={br.startTime}
                          onChange={(e) => handleUpdateBreak(index, "startTime", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50/50 border border-transparent rounded-xl focus:bg-white focus:border-primary-blue outline-none text-sm font-bold text-slate-900"
                        />
                        <span className="text-slate-300">to</span>
                        <input 
                          type="time" 
                          value={br.endTime}
                          onChange={(e) => handleUpdateBreak(index, "endTime", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50/50 border border-transparent rounded-xl focus:bg-white focus:border-primary-blue outline-none text-sm font-bold text-slate-900"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveBreak(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {breaks.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-50 rounded-[28px] text-center">
                      <p className="text-xs font-medium text-slate-400 italic">No clinical breaks scheduled for this shift template.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 3: GENERATED SLOTS PREVIEW */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">4. Session Grid & Personal Blocking</h3>
                </div>
                <p className="text-xs text-slate-400 ml-1">Click any slot to manually toggle its availability for this doctor's weekly profile.</p>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {generatedSlots.map(slot => {
                    const isBreak = breaks.some(br => isInsideRange(slot, br.startTime, br.endTime));
                    const isBlocked = manualBlocks.includes(slot);

                    return (
                      <button
                        key={slot}
                        onClick={() => !isBreak && handleToggleSlot(slot)}
                        disabled={isBreak}
                        className={cn(
                          "py-3 rounded-xl text-[11px] font-black transition-all border shadow-sm relative group overflow-hidden",
                          isBreak 
                            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" 
                            : isBlocked 
                              ? "bg-red-500 border-red-500 text-white shadow-red-500/20" 
                              : "bg-green-500 border-green-500 text-white shadow-green-500/20 hover:scale-105"
                        )}
                      >
                        {slot}
                        {isBreak && <span className="absolute inset-0 flex items-center justify-center bg-slate-100/50 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">BREAK</span>}
                      </button>
                    );
                  })}
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

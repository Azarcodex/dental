"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { UserSquare2, Search, Plus, Save, Trash2, Clock, CalendarDays, Loader2, RefreshCw, Info, Sunrise, Sun, Sunset } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { cn, formatTimeTo12h } from "@/lib/utils";

interface Break { startTime: string; endTime: string; }

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const toTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
const inRange = (t: string, s: string, e: string) => toMin(t) >= toMin(s) && toMin(t) < toMin(e);

export default function SlotManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // "global" = editing weekly defaults; number = editing that specific day
  const [editingDay, setEditingDay] = useState<"global" | number>("global");

  // Global defaults
  const [activeDays, setActiveDays] = useState<number[]>([1,2,3,4,5]);
  const [gStart, setGStart] = useState("09:00");
  const [gEnd, setGEnd] = useState("17:00");
  const [gDuration, setGDuration] = useState(30);
  const [gBreaks, setGBreaks] = useState<Break[]>([]);
  const [gBlocks, setGBlocks] = useState<string[]>([]);

  // Day-specific overrides
  const [isCustom, setIsCustom] = useState(false);
  const [dStart, setDStart] = useState("09:00");
  const [dEnd, setDEnd] = useState("17:00");
  const [dDuration, setDDuration] = useState(30);
  const [dBreaks, setDBreaks] = useState<Break[]>([]);
  const [dBlocks, setDBlocks] = useState<string[]>([]);

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await axiosInstance.get("/doctors")).data.data,
  });

  const { data: details } = useQuery({
    queryKey: ["doctor-schedule", doctorId],
    queryFn: async () => (await axiosInstance.get(`/doctors/${doctorId}/schedule`)).data.data,
    enabled: !!doctorId,
  });

  // Load data when doctor or selected day changes
  useEffect(() => {
    if (!details) return;
    const wd = details.weeklyDefault;
    if (wd) {
      setGStart(wd.startTime); setGEnd(wd.endTime); setGDuration(wd.slotDuration);
      setActiveDays(wd.activeDays ? wd.activeDays.split(",").map(Number) : [1,2,3,4,5]);
      try { setGBreaks(JSON.parse(wd.breaks || "[]")); } catch { setGBreaks([]); }
    }

    if (editingDay !== "global") {
      const sched = details.schedules?.find((s: any) => s.dayOfWeek === editingDay);
      const dayBlocks = details.blocks?.filter((b: any) => b.dayOfWeek === editingDay) || [];
      setIsCustom(sched?.isCustom ?? false);
      setDStart(sched?.startTime ?? wd?.startTime ?? "09:00");
      setDEnd(sched?.endTime ?? wd?.endTime ?? "17:00");
      setDDuration(sched?.slotDuration ?? wd?.slotDuration ?? 30);
      const breaks: Break[] = [], blocks: string[] = [];
      dayBlocks.forEach((b: any) => {
        if (toMin(b.endTime) - toMin(b.startTime) === (sched?.slotDuration ?? 30)) blocks.push(b.startTime);
        else breaks.push({ startTime: b.startTime, endTime: b.endTime });
      });
      setDBreaks(breaks); setDBlocks(blocks);
    }
  }, [details, editingDay]);

  const isGlobal = editingDay === "global";
  const curStart = isGlobal ? gStart : dStart;
  const curEnd = isGlobal ? gEnd : dEnd;
  const curDuration = isGlobal ? gDuration : dDuration;
  const curBreaks = isGlobal ? gBreaks : dBreaks;
  const curBlocks = isGlobal ? gBlocks : dBlocks;
  const canEdit = isGlobal || isCustom;

  const slots = useMemo(() => {
    const result: string[] = [];
    let cur = toMin(curStart);
    const end = toMin(curEnd);
    while (cur + curDuration <= end) { result.push(toTime(cur)); cur += curDuration; }
    return result;
  }, [curStart, curEnd, curDuration]);

  const grouped = useMemo(() => {
    const g = { morning: [] as string[], afternoon: [] as string[], evening: [] as string[] };
    slots.forEach(s => { const h = parseInt(s); if (h < 12) g.morning.push(s); else if (h < 17) g.afternoon.push(s); else g.evening.push(s); });
    return g;
  }, [slots]);

  const filteredDoctors = doctors?.filter((d: any) =>
    `${d.firstName} ${d.lastName || ""}`.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );
  const selectedDoctor = doctors?.find((d: any) => d.id === doctorId);

  const updateBreak = (i: number, key: keyof Break, val: string) => {
    if (isGlobal) { const b = [...gBreaks]; b[i][key] = val; setGBreaks(b); }
    else { const b = [...dBreaks]; b[i][key] = val; setDBreaks(b); }
  };
  const removeBreak = (i: number) => {
    if (isGlobal) setGBreaks(gBreaks.filter((_, j) => j !== i));
    else setDBreaks(dBreaks.filter((_, j) => j !== i));
  };
  const addBreak = () => {
    if (isGlobal) setGBreaks([...gBreaks, { startTime: "12:00", endTime: "13:00" }]);
    else setDBreaks([...dBreaks, { startTime: "12:00", endTime: "13:00" }]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isGlobal) {
        return axiosInstance.post(`/doctors/${doctorId}/schedule`, {
          type: "global", days: activeDays, startTime: gStart, endTime: gEnd, slotDuration: gDuration,
          breaks: [...gBreaks, ...gBlocks.map(t => ({ startTime: t, endTime: toTime(toMin(t) + gDuration) }))]
        });
      } else {
        return axiosInstance.post(`/doctors/${doctorId}/schedule`, {
          type: "day", dayOfWeek: editingDay, startTime: dStart, endTime: dEnd, slotDuration: dDuration, breaks: dBreaks, manualBlocks: dBlocks
        });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doctor-schedule", doctorId] }); toast.success("Saved!"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Save failed"),
  });

  const resetMutation = useMutation({
    mutationFn: async () => axiosInstance.post(`/doctors/${doctorId}/schedule`, { type: "reset-day", dayOfWeek: editingDay }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doctor-schedule", doctorId] }); toast.success("Reset to default!"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Reset failed"),
  });

  const toggleSlot = (slot: string) => {
    if (loadingSlot) return;
    if (!canEdit) { toast.error("Click 'Customize' to edit this day"); return; }
    const updated = curBlocks.includes(slot) ? curBlocks.filter(t => t !== slot) : [...curBlocks, slot];
    setLoadingSlot(slot);
    if (isGlobal) setGBlocks(updated); else setDBlocks(updated);
    axiosInstance.post(`/doctors/${doctorId}/schedule`,
      isGlobal
        ? { type: "global", days: activeDays, startTime: gStart, endTime: gEnd, slotDuration: gDuration, breaks: [...gBreaks, ...updated.map(t => ({ startTime: t, endTime: toTime(toMin(t) + gDuration) }))] }
        : { type: "day", dayOfWeek: editingDay, startTime: dStart, endTime: dEnd, slotDuration: dDuration, breaks: dBreaks, manualBlocks: updated }
    ).then(() => { queryClient.invalidateQueries({ queryKey: ["doctor-schedule", doctorId] }); toast.success("Updated!"); })
     .catch((e: any) => { toast.error(e?.response?.data?.message || "Failed"); queryClient.invalidateQueries({ queryKey: ["doctor-schedule", doctorId] }); })
     .finally(() => setLoadingSlot(null));
  };

  const getDayStatus = (i: number) => {
    const s = details?.schedules?.find((s: any) => s.dayOfWeek === i);
    if (!s) {
      return activeDays.includes(i) ? "default" : "inactive";
    }
    return s.isCustom ? "custom" : "default";
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-5 overflow-hidden text-black">

      {/* LEFT: Doctor List */}
      <div className="w-full lg:w-[300px] bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-black mb-3">Doctors</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:border-primary-green text-sm font-medium text-black placeholder-slate-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 luxe-scrollbar">
          {loadingDoctors ? [1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />) :
            filteredDoctors?.map((d: any) => (
              <div key={d.id} onClick={() => { setDoctorId(d.id); setEditingDay("global"); }}
                className={cn("p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all",
                  doctorId === d.id ? "bg-primary-green/5 border-primary-green ring-1 ring-primary-green/20" : "border-transparent hover:bg-slate-50")}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-black">
                    {d.profilePhoto ? <img src={d.profilePhoto} className="w-full h-full object-cover" alt="" /> : <UserSquare2 size={20} />}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white", d.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300")} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-black text-sm truncate">Dr. {d.firstName} {d.lastName || ""}</p>
                  <p className="text-[10px] font-semibold text-slate-800 uppercase tracking-wide truncate">{d.specialization}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT: Schedule Editor */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {!doctorId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-black"><CalendarDays size={32} /></div>
            <div><h3 className="text-lg font-bold text-black">Select a Doctor</h3>
              <p className="text-sm text-slate-600 mt-1">Choose a doctor to manage their availability</p></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-black">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName || ""}</h2>
                <p className="text-xs text-slate-700 font-medium mt-0.5">{selectedDoctor?.specialization} · Availability Manager</p>
              </div>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || (!isGlobal && !isCustom)}
                className="flex items-center gap-2 bg-primary-green text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-green/20 disabled:opacity-40 active:scale-95 shrink-0">
                {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
              </button>
            </div>

            <div className="flex-1 overflow-y-auto luxe-scrollbar">
              <div className="p-6 space-y-6">

                {/* Day Selector Row */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-black uppercase tracking-wider">Schedule View</p>
                    <button onClick={() => setEditingDay("global")}
                      className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all",
                        editingDay === "global" ? "bg-primary-blue text-white" : "bg-slate-100 text-black hover:bg-slate-200")}>
                      Weekly Defaults
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[0,1,2,3,4,5,6].map(i => {
                      const status = getDayStatus(i);
                      const isSelected = editingDay === i;
                      return (
                        <button key={i} onClick={() => setEditingDay(i)}
                          className={cn("py-3 rounded-2xl text-xs font-black flex flex-col items-center gap-1 transition-all border relative",
                            isSelected ? "bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/20" :
                            activeDays.includes(i) ? "bg-slate-50 border-slate-200 text-black hover:border-primary-blue/40" :
                            "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>
                          <span>{DAYS[i]}</span>
                          {status === "custom" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />}
                          {status === "default" && activeDays.includes(i) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 absolute top-1.5 right-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-black font-semibold"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Default</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-black font-semibold"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Custom</span>
                  </div>
                </div>

                {/* Context Banner */}
                {editingDay !== "global" && (
                  <div className={cn("flex items-center justify-between p-4 rounded-2xl border",
                    isCustom ? "bg-amber-50 border-amber-200/60" : "bg-blue-50 border-blue-200/60")}>
                    <div>
                      <p className="text-sm font-bold text-black">{FULL_DAYS[editingDay as number]}</p>
                      <p className="text-xs text-black mt-0.5">{isCustom ? "Custom override active for this day" : "Using weekly default settings"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCustom ? (
                        <button onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}
                          className="flex items-center gap-1.5 text-xs font-bold text-black bg-white border border-slate-200 px-3 py-2 rounded-xl hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50">
                          {resetMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Reset
                        </button>
                      ) : (
                        <button onClick={() => { setIsCustom(true); setDStart(gStart); setDEnd(gEnd); setDDuration(gDuration); setDBreaks([...gBreaks]); setDBlocks([]); }}
                          className="text-xs font-bold text-primary-blue bg-white border border-primary-blue/30 px-3 py-2 rounded-xl hover:bg-primary-blue hover:text-white transition-all">
                          Customize This Day
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Days Toggle (only in global mode) */}
                {editingDay === "global" && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-black uppercase tracking-wider">Active Working Days</p>
                    <div className="flex gap-2 flex-wrap">
                      {[0,1,2,3,4,5,6].map(i => (
                        <button key={i} onClick={() => setActiveDays(p => p.includes(i) ? p.filter(d => d !== i) : [...p, i])}
                          className={cn("px-3 py-1.5 rounded-xl text-xs font-black border transition-all",
                            activeDays.includes(i) ? "bg-primary-blue border-primary-blue text-white" : "bg-white border-slate-200 text-black hover:border-slate-300")}>
                          {DAYS[i]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timings */}
                <div className="space-y-2">
                  <p className="text-xs font-black text-black uppercase tracking-wider">
                    {editingDay === "global" ? "Default Timings" : `${FULL_DAYS[editingDay as number]} Timings`}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Start", val: curStart, set: isGlobal ? setGStart : setDStart },
                      { label: "End", val: curEnd, set: isGlobal ? setGEnd : setDEnd },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-[10px] font-black text-black uppercase">{label}</p>
                        <input type="time" value={val} disabled={!canEdit} onChange={e => set(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-blue font-bold text-black text-sm transition-all disabled:opacity-50" />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-black uppercase">Slot (min)</p>
                      <select value={curDuration} disabled={!canEdit}
                        onChange={e => isGlobal ? setGDuration(Number(e.target.value)) : setDDuration(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-blue font-bold text-black text-sm transition-all appearance-none disabled:opacity-50">
                        {[15,20,30,45,60,90,120].map(v => <option key={v} value={v}>{v} min</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Breaks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-black uppercase tracking-wider">Breaks</p>
                    <button onClick={addBreak} disabled={!canEdit}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-primary-blue bg-primary-blue/5 hover:bg-primary-blue hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {curBreaks.length === 0 ? (
                    <p className="text-xs text-slate-50 font-medium py-2">No breaks configured</p>
                  ) : (
                    <div className="space-y-2">
                      {curBreaks.map((br, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <Clock size={14} className="text-amber-500 shrink-0" />
                          <input type="time" value={br.startTime} disabled={!canEdit} onChange={e => updateBreak(i, "startTime", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-black outline-none focus:border-primary-blue disabled:opacity-50" />
                          <span className="text-slate-300 text-xs">–</span>
                          <input type="time" value={br.endTime} disabled={!canEdit} onChange={e => updateBreak(i, "endTime", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-black outline-none focus:border-primary-blue disabled:opacity-50" />
                          <button onClick={() => removeBreak(i)} disabled={!canEdit}
                            className="p-1 text-slate-300 hover:text-red-400 rounded-lg transition-all disabled:opacity-40">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slot Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-black uppercase tracking-wider">Available Slots</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-black uppercase">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Open</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Blocked</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Break</span>
                    </div>
                  </div>

                  {slots.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <Info size={24} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">No slots — adjust the timings above</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: "Morning", icon: <Sunrise size={13} className="text-orange-400" />, slots: grouped.morning },
                        { label: "Afternoon", icon: <Sun size={13} className="text-blue-400" />, slots: grouped.afternoon },
                        { label: "Evening", icon: <Sunset size={13} className="text-indigo-400" />, slots: grouped.evening },
                      ].filter(g => g.slots.length > 0).map(group => (
                        <div key={group.label}>
                          <div className="flex items-center gap-1.5 mb-2">
                            {group.icon}
                            <span className="text-[10px] font-black text-black uppercase tracking-wider">{group.label}</span>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {group.slots.map(slot => {
                              const isBreak = curBreaks.some(b => inRange(slot, b.startTime, b.endTime));
                              const isBlocked = curBlocks.includes(slot);
                              const isLoading = loadingSlot === slot;
                              return (
                                <button key={slot} onClick={() => !isBreak && toggleSlot(slot)} disabled={isBreak || !!loadingSlot}
                                  className={cn("py-2.5 rounded-xl text-[10px] font-black transition-all border flex items-center justify-center",
                                    isBreak ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" :
                                    isBlocked ? "bg-red-500 border-red-500 text-white shadow-sm shadow-red-500/20" :
                                    "bg-white border-slate-200 text-black hover:border-primary-green hover:text-primary-green hover:shadow-sm")}>
                                  {isLoading ? <Loader2 size={11} className="animate-spin" /> : (isBreak ? "—" : formatTimeTo12h(slot))}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-8" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

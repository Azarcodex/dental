"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn, formatTimeTo12h } from "@/lib/utils";

interface SlotSelectorProps {
  doctorId: string;
  date: string;
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}

const fetchSlots = async (doctorId: string, date: string) => {
  if (!doctorId || !date) return [];
  const { data } = await axiosInstance.get(`/doctors/${doctorId}/slots`, {
    params: { date }
  });
  return data.slots;
};

export default function SlotSelector({ doctorId, date, selectedSlot, onSelect }: SlotSelectorProps) {
  const { data: slots, isLoading, error } = useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: () => fetchSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-10 bg-gray-50 rounded-xl border border-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
        <AlertCircle size={20} />
        Failed to load available slots for this date.
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-3xl text-center border-2 border-dashed border-gray-100">
        <Clock size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-500">No available slots on this day.</p>
        <p className="text-xs text-gray-400">Please try another date or doctor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {slots.map((slotObj: { time: string, available: boolean }) => {
        const isSelected = selectedSlot === slotObj.time;
        const isDisabled = !slotObj.available;
        
        return (
          <button
            key={slotObj.time}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(slotObj.time)}
            className={cn(
              "py-3 px-2 rounded-xl text-sm font-bold transition-all border flex flex-col items-center gap-1",
              isSelected
                ? "bg-primary-green border-primary-green text-white shadow-lg shadow-primary-green/20 scale-105"
                : isDisabled 
                  ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-white border-gray-100 text-gray-900 hover:border-primary-green hover:text-primary-green hover:shadow-sm"
            )}
          >
            {formatTimeTo12h(slotObj.time)}
            {isSelected && <CheckCircle2 size={10} />}
          </button>
        );
      })}
    </div>
  );
}

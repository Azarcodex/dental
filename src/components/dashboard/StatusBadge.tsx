import React from "react";
import { cn } from "@/lib/utils";

export type AppointmentStatus = "PENDING" | "APPROVED" | "WAITING" | "IN_CONSULTATION" | "DONE" | "CANCELLED" | "BOOKED";

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-100",
  },
  APPROVED: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  WAITING: {
    label: "Waiting",
    classes: "bg-blue-50 text-blue-700 border-blue-100",
  },
  IN_CONSULTATION: {
    label: "In Consultation",
    classes: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  DONE: {
    label: "Completed",
    classes: "bg-green-50 text-green-700 border-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-700 border-red-100",
  },
  BOOKED: {
    label: "Booked",
    classes: "bg-blue-50 text-blue-700 border-blue-100",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.WAITING;

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};

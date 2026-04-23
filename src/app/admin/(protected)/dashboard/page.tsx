"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  Search,
  Filter,
  User,
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle,
  MoreVertical,
  SkipForward,
  UserX
} from "lucide-react";
import { cn, formatTimeTo12h } from "@/lib/utils";
import { StatusBadge, AppointmentStatus } from "@/components/dashboard/StatusBadge";
import { PatientDrawer } from "@/components/dashboard/PatientDrawer";
import { getLocalDateString } from "@/lib/dateUtils";

// --- API Helpers ---

const fetchDashboardStats = async (date: string, doctorId?: string) => {
  const { data } = await axiosInstance.get("/admin/dashboard/stats", {
    params: { date, doctorId }
  });
  return data.data;
};

const fetchAppointments = async (date: string, doctorId?: string, status?: string) => {
  const { data } = await axiosInstance.get("/admin/dashboard/appointments", {
    params: { date, doctorId, status }
  });
  return data.data;
};

const fetchDoctors = async () => {
  const { data } = await axiosInstance.get("/doctors");
  return data.data;
};

// --- Dashboard Component ---

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  
  // Patient Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedDate, selectedDoctor],
    queryFn: () => fetchDashboardStats(selectedDate, selectedDoctor),
  });

  const { data: appointments, isLoading: appsLoading } = useQuery({
    queryKey: ["dashboard-appointments", selectedDate, selectedDoctor, selectedStatus],
    queryFn: () => fetchAppointments(selectedDate, selectedDoctor, selectedStatus),
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: fetchDoctors,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axiosInstance.patch(`/admin/dashboard/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const handleStatusChange = (id: string, nextStatus: AppointmentStatus) => {
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  const openDrawer = (appointment: any) => {
    setActivePatient(appointment.patient);
    setActiveAppointment(appointment);
    setDrawerOpen(true);
  };

  const statCards = [
    { label: "Total Appointments", value: stats?.total || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved", value: stats?.waiting || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Consultation", value: stats?.inConsultation || 0, icon: User, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Today's Appointments</h1>
          <p className="text-sm text-black font-semibold">Manage patient flow and consultation statuses.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <Clock size={16} className="text-primary-green" />
          <span className="font-bold text-black uppercase text-[10px] tracking-widest">Live Feed</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn("p-3 rounded-xl shrink-0", stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-black line-height-none">{stat.value}</p>
              <p className="text-xs font-bold text-black uppercase tracking-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Filters Row */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
            <Calendar size={16} className="text-black" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none bg-transparent text-sm focus:ring-0 w-full font-bold text-black"
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
            <Stethoscope size={16} className="text-black" />
            <select 
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="border-none bg-transparent text-sm focus:ring-0 w-full font-bold text-black"
            >
              <option value="">All Doctors</option>
              {doctors?.map((doc: any) => (
                <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm min-w-[150px]">
            <Filter size={16} className="text-black" />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border-none bg-transparent text-sm focus:ring-0 w-full font-bold text-black"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved / Confirmed</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Token</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Doctor / Slot</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appsLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary-green" size={32} />
                      <p className="text-sm font-medium text-gray-500">Loading appointments...</p>
                    </div>
                  </td>
                </tr>
              ) : Object.keys(appointments || {}).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Calendar size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">No appointments for this date</p>
                        <p className="text-sm">Filter criteria returned no results.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((app: any) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {app.token || "---"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{app.patient.fullName}</p>
                        <p className="text-xs text-gray-500">{app.patient.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green overflow-hidden">
                          {app.doctor.profilePhoto ? (
                            <img 
                              src={app.doctor.profilePhoto} 
                              alt={app.doctor.lastName}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Dr. {app.doctor.firstName} {app.doctor.lastName}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex items-center gap-2">
                            <Clock size={10} /> {formatTimeTo12h(app.startTime)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded border",
                        app.bookingType === "Walk-in" ? "text-purple-600 bg-purple-50 border-purple-100" : "text-blue-600 bg-blue-50 border-blue-100"
                      )}>
                        {app.bookingType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status as AppointmentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === "PENDING" && (
                          <button 
                            onClick={() => handleStatusChange(app.id, "APPROVED")}
                            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                          >
                            Approve
                          </button>
                        )}
                        {(app.status === "APPROVED" || app.status === "WAITING" || app.status === "BOOKED") && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(app.id, "IN_CONSULTATION")}
                              className="px-3 py-1.5 bg-primary-green text-white text-xs font-bold rounded-lg hover:bg-primary-green-dark transition-colors flex items-center gap-1.5"
                            >
                              Arrived
                            </button>
                            <button 
                              onClick={() => handleStatusChange(app.id, "CANCELLED")}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <UserX size={16} />
                            </button>
                          </>
                        )}
                        {app.status === "IN_CONSULTATION" && (
                          <button 
                            onClick={() => handleStatusChange(app.id, "DONE")}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                          >
                            Mark Done
                          </button>
                        )}
                        {(app.status === "DONE" || app.status === "CANCELLED") && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-2">
                            {app.status === "DONE" ? "Completed" : "Cancelled"}
                          </span>
                        )}
                        <button 
                          onClick={() => openDrawer(app)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:text-primary-green hover:bg-primary-green/5 rounded-lg transition-all"
                        >
                          View <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        patient={activePatient}
        appointment={activeAppointment}
      />
    </div>
  );
}

const Stethoscope = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"/><path d="M10 2v2"/><path d="M14 2v2"/><path d="M3 10v4c0 4.4 3.6 8 8 8s8-3.6 8-8v-4"/><path d="M12 11V6"/><path d="M8 8H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4"/><path d="M20 8h-4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z"/>
  </svg>
);

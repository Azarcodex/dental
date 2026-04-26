"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Search, Plus, UserCircle2, Phone, ChevronRight, Filter, Loader2, Calendar } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const fetchPatients = async (query: string) => {
  const { data } = await axiosInstance.get("/admin/patients", {
    params: { query }
  });
  return data.data;
};

export default function PatientsRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients-registry", debouncedSearch],
    queryFn: () => fetchPatients(debouncedSearch),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients Registry</h1>
          <p className="text-sm text-gray-500">Search and manage all clinical patient records.</p>
        </div>
        
        <Link 
          href="/admin/booking"
          className="flex items-center gap-2 bg-primary-green hover:bg-primary-green-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          New Patient Registration
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-green transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by patient name or phone number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-green/10 outline-none w-full transition-all text-sm font-bold text-black placeholder:text-gray-400"
          />
        </div>
        <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Patient ID</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Age / Gender</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Visits</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest">Last Visit</th>
                <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary-green" size={32} />
                      <p className="text-sm font-medium text-gray-500">Loading patients...</p>
                    </div>
                  </td>
                </tr>
              ) : patients?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Search size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">No patients found</p>
                        <p className="text-sm">Try a different search term or register a new patient.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                patients?.map((patient: any) => {
                  const lastAppointment = patient.appointments && patient.appointments.length > 0 ? patient.appointments[0] : null;
                  
                  return (
                    <tr key={patient.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-primary-green bg-primary-green/5 px-2 py-1 rounded-lg">
                          {patient.displayId || "P-???"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{patient.fullName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Phone size={14} className="text-gray-400" />
                          {patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 capitalize">
                          {patient.age}y &bull; {patient.gender}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{patient.appointments?.length || 0}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Visits</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {lastAppointment ? (
                          <div>
                            <p className="text-sm text-gray-900 font-semibold">
                              {new Date(lastAppointment.date).toLocaleDateString("en-US", { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">{lastAppointment.startTime}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No history</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/patients/${patient.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:text-primary-green hover:border-primary-green hover:bg-primary-green/5 transition-all shadow-sm"
                        >
                          View Profile <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

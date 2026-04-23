"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
  User, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  Droplet, 
  History,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn, formatTimeTo12h } from "@/lib/utils";
import { StatusBadge, AppointmentStatus } from "@/components/dashboard/StatusBadge";

const fetchPatientProfile = async (id: string) => {
  const { data } = await axiosInstance.get(`/admin/patients/${id}`);
  return data.data;
};

export default function PatientProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ["patient-profile", id],
    queryFn: () => fetchPatientProfile(id),
  });

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary-green mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading patient profile...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <p className="text-gray-900 font-bold">Patient Not Found</p>
        <p className="text-gray-500 mb-6">The requested patient record could not be retrieved.</p>
        <Link href="/admin/patients" className="text-primary-green font-bold flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/patients" 
          className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
          <p className="text-sm text-gray-500">Registry ID: {patient.displayId || "P-???"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header / Avatar */}
            <div className="bg-primary-green/5 p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border-4 border-white flex items-center justify-center text-primary-green mb-4">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{patient.fullName}</h2>
              <p className="text-sm font-bold text-primary-green uppercase tracking-wider">{patient.displayId}</p>
            </div>

            {/* Info List */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900">{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Age / Gender</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{patient.age} years &bull; {patient.gender}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Droplet size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</p>
                  <p className="text-sm font-bold text-red-600">{patient.bloodGroup || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered since {new Date(patient.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs and History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100 px-6">
              <button className="px-6 py-4 border-b-2 border-primary-green text-primary-green text-sm font-bold flex items-center gap-2">
                <History size={18} /> Appointment History
              </button>
            </div>

            {/* List */}
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30 border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date / Token</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialization</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patient.appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-gray-400 text-sm font-medium italic">No prior appointments found.</p>
                      </td>
                    </tr>
                  ) : (
                    patient.appointments.map((app: any) => (
                      <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-100">
                              {app.token || "---"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {new Date(app.date).toLocaleDateString("en-US", { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                  })}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                  <Clock size={10} /> {formatTimeTo12h(app.startTime)}
                                </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-gray-900">
                            Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <p className="text-xs font-semibold text-gray-600">{app.specialization}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-semibold text-gray-600">{app.department}</p>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={app.status as AppointmentStatus} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Table from "@/components/ui/Table";
import { Plus, UserSquare2, Edit2, ShieldAlert, Search, Loader2, Power } from "lucide-react";
import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import DoctorForm from "@/components/forms/DoctorForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

const fetchDoctors = async () => {
  const { data } = await axiosInstance.get("/doctors");
  return data.data;
};

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  
  // Status Toggle State
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetDoctor, setTargetDoctor] = useState<any>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return axiosInstance.put(`/doctors/${id}`, { status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor status updated successfully");
      setShowConfirm(false);
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  const handleToggleClick = (doctor: any) => {
    setTargetDoctor(doctor);
    setShowConfirm(true);
  };

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((d: any) => 
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.specialization.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.department.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [doctors, debouncedSearch]);

  const handleEdit = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Medical Staff</h1>
          <p className="text-slate-500 font-medium">Manage and monitor your clinical personnel directory.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green focus:bg-white transition-all w-full md:w-72 font-bold text-black shadow-inner placeholder:text-gray-400"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary-green hover:bg-primary-green-dark text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-green/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            Register Doctor
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors?.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 p-20 text-center shadow-sm shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[24px] flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-50/50">
            <Search size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No matching doctors found</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
            We couldn't find any doctors matching <span className="text-slate-900 font-bold">"{searchQuery}"</span>. 
            Try refining your keywords or checking another department.
          </p>
          <button 
            onClick={() => setSearchQuery("")}
            className="mt-8 text-primary-green font-bold text-sm hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <Table headers={["Name", "Gender", "Specialization", "Department", "Fee", "Status", "Actions"]}>
          {filteredDoctors?.map((doctor: any) => (
            <tr key={doctor.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden">
                    {doctor.profilePhoto ? (
                      <img 
                        src={doctor.profilePhoto} 
                        alt={doctor.firstName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserSquare2 size={20} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-[14px] leading-tight">{doctor.firstName} {doctor.lastName}</span>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{doctor.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-[13px] text-slate-500 font-bold uppercase tracking-wider">
                {doctor.gender === 'MALE' ? 'Male' : doctor.gender === 'FEMALE' ? 'Female' : 'Other'}
              </td>
              <td className="px-6 py-5 text-[13px] text-slate-600 font-bold">{doctor.specialization}</td>
              <td className="px-6 py-5">
                <span className="text-[10px] font-bold text-primary-blue bg-primary-blue/5 border border-primary-blue/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {doctor.department}
                </span>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-slate-900 font-mono">₹ {doctor.consultationFee.toLocaleString()}</td>
              <td className="px-6 py-5">
                <button 
                  onClick={() => handleToggleClick(doctor)}
                  className="flex items-center gap-2 group/status"
                >
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${doctor.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`} />
                    {doctor.status === 'ACTIVE' && <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute inset-0" />}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${doctor.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400 opacity-60 group-hover/status:opacity-100 transition-opacity'}`}>
                    {doctor.status}
                  </span>
                </button>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(doctor)}
                    className="p-2.5 text-slate-400 hover:text-primary-blue hover:bg-primary-blue/5 rounded-2xl transition-all"
                    title="Edit Profile"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleToggleClick(doctor)}
                    className={`p-2.5 rounded-2xl transition-all ${doctor.status === 'ACTIVE' ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                    title={doctor.status === 'ACTIVE' ? "Deactivate Account" : "Activate Account"}
                  >
                    <Power size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Status Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => toggleStatusMutation.mutate({ id: targetDoctor.id, status: targetDoctor.status })}
        title={targetDoctor?.status === "ACTIVE" ? "Deactivate Doctor Account" : "Activate Doctor Account"}
        description={`Are you sure you want to change the status of Dr. ${targetDoctor?.firstName} ${targetDoctor?.lastName}? This will impact their availability for bookings.`}
        confirmText={targetDoctor?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        isDanger={targetDoctor?.status === "ACTIVE"}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoctor ? "Edit Doctor Information" : "Register New Doctor"}
      >
        <DoctorForm 
          onSuccess={() => setIsModalOpen(false)} 
          initialData={selectedDoctor}
        />
      </Modal>
    </div>
  );
}

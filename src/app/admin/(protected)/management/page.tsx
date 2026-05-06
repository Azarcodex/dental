"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AdminForm from "@/components/forms/AdminForm";
import { AdminFormValues } from "@/lib/validations/adminSchema";

export default function AdminManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // --- Queries ---
  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/management");
      return data.data;
    },
    enabled: isSuperAdmin
  });

  // --- Mutations ---
  const createAdminMutation = useMutation({
    mutationFn: async (data: AdminFormValues) => {
      return axiosInstance.post("/admin/management", data);
    },
    onSuccess: () => {
      toast.success("Administrative account created");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create admin");
    }
  });

  const updateAdminMutation = useMutation({
    mutationFn: async (data: AdminFormValues) => {
      return axiosInstance.patch(`/admin/management/${selectedAdmin.id}`, data);
    },
    onSuccess: () => {
      toast.success("Admin profile updated");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setSelectedAdmin(null);
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update admin");
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/admin/management/${id}`);
    },
    onSuccess: () => {
      toast.success("Admin account deleted");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setAdminToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete admin");
    }
  });

  // --- Helpers ---

  if (!isSuperAdmin) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-6">
          <Shield size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm font-medium">Only Super Administrators have permission to manage system accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Administrators</h1>
          <p className="text-slate-500 font-medium">Manage personnel access levels and administrative profiles.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedAdmin(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-green text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary-green/20 hover:bg-primary-green-dark transition-all transform active:scale-95"
        >
          <UserPlus size={20} />
          Create New Admin
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-end">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm w-full md:w-auto min-w-[250px]">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Personnel</p>
            <p className="text-xl font-black text-slate-900">{admins?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative animate-fade-in">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-white border border-slate-100 rounded-3xl">
            <Loader2 className="animate-spin text-primary-green" size={32} />
          </div>
        ) : admins?.length > 0 ? (
          <Table headers={["Personnel", "Role & Status", "Contact Details", "Location", "Created", ""]}>
            {admins.map((admin: any) => (
              <tr key={admin.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-lg shadow-inner ring-2 ring-white">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{admin.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">@{admin.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    {admin.role === "SUPER_ADMIN" ? (
                      <span className="w-fit text-[10px] font-black uppercase tracking-widest bg-primary-blue/10 text-primary-blue px-2.5 py-1 rounded-lg border border-primary-blue/20 flex items-center gap-1.5">
                        <ShieldCheck size={12} /> Super Admin
                      </span>
                    ) : (
                      <span className="w-fit text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <Shield size={12} /> Administrator
                      </span>
                    )}
                    <span className="w-fit text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
                      Active
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">{admin.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">{admin.phone || "N/A"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-start gap-2 max-w-[200px]">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-500 leading-relaxed">
                        {admin.address || "No address provided"}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs font-bold">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsModalOpen(true);
                      }}
                      className="p-2.5 text-slate-400 hover:text-primary-blue hover:bg-primary-blue/5 rounded-xl transition-all"
                      title="Edit Profile"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setAdminToDelete(admin)}
                      disabled={admin.id === user?.id}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        admin.id === user?.id 
                          ? "text-slate-200 cursor-not-allowed" 
                          : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                      )}
                      title={admin.id === user?.id ? "You cannot delete yourself" : "Delete Account"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl text-center p-6">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">No personnel found</h3>
            <p className="text-sm text-slate-500 max-w-xs">Create a new administrative account to populate the directory.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAdmin(null);
        }} 
        title={selectedAdmin ? "Edit Administrator" : "New Administrator Account"}
      >
        <AdminForm 
          isEdit={!!selectedAdmin}
          initialData={selectedAdmin}
          isLoading={createAdminMutation.isPending || updateAdminMutation.isPending}
          onSubmit={(data) => {
            if (selectedAdmin) {
              updateAdminMutation.mutate(data);
            } else {
              createAdminMutation.mutate(data);
            }
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!adminToDelete}
        onClose={() => setAdminToDelete(null)}
        onConfirm={() => deleteAdminMutation.mutate(adminToDelete.id)}
        isLoading={deleteAdminMutation.isPending}
        title="Delete Administrator"
        description={`Are you sure you want to delete @${adminToDelete?.username}'s account? This action is permanent and cannot be undone.`}
        confirmText="Permanently Delete"
        isDanger
      />
    </div>
  );
}

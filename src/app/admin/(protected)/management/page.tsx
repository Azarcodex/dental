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
  MoreVertical, 
  Loader2, 
  AlertCircle,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

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
    mutationFn: async (data: any) => {
      return axiosInstance.post("/admin/management", data);
    },
    onSuccess: () => {
      toast.success("Admin created successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create admin");
    }
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.patch("/admin/credentials", data);
    },
    onSuccess: () => {
      toast.success("Credentials updated");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setSelectedAdmin(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update credentials");
    }
  });

  if (!isSuperAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 max-w-sm">Only Super Admins can access this area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">User Management</h1>
          <p className="text-gray-500">Manage administrative accounts and permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add New Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary-green" size={24} />
                </td>
              </tr>
            ) : admins?.map((admin: any) => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-green/10 text-primary-green flex items-center justify-center font-bold">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{admin.name}</p>
                      <p className="text-xs text-gray-500">@{admin.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {admin.role === "SUPER_ADMIN" ? (
                      <span className="text-[10px] font-bold uppercase tracking-tight text-primary-blue bg-primary-blue/5 px-2 py-0.5 rounded border border-primary-blue/10 flex items-center gap-1">
                        <ShieldCheck size={10} /> Super Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-600">{admin.email || "---"}</p>
                  <p className="text-xs text-gray-400">{admin.phone || "---"}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedAdmin(admin)}
                    className="p-2 text-gray-400 hover:text-primary-blue hover:bg-primary-blue/5 rounded-lg transition-all"
                  >
                    <Key size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals (Simplified for brevity, usually you'd have full forms here) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Create Admin</h2>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createAdminMutation.mutate(Object.fromEntries(formData));
            }} className="space-y-4">
              <input name="name" placeholder="Full Name" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" required />
              <input name="username" placeholder="Username" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" required />
              <input name="password" type="password" placeholder="Password" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" required />
              <select name="role" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={createAdminMutation.isPending} className="flex-1 py-3 bg-primary-green text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {createAdminMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-2">Manage Credentials</h2>
            <p className="text-sm text-gray-500 mb-6">Updating credentials for @{selectedAdmin.username}</p>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateCredentialsMutation.mutate({ 
                targetId: selectedAdmin.id,
                ...Object.fromEntries(formData) 
              });
            }} className="space-y-4">
              <input name="username" placeholder="New Username" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
              <input name="password" type="password" placeholder="New Password" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedAdmin(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={updateCredentialsMutation.isPending} className="flex-1 py-3 bg-primary-blue text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {updateCredentialsMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

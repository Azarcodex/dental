"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminSchema, AdminFormValues } from "@/lib/validations/adminSchema";
import { Loader2, User, Mail, Phone, MapPin, Shield, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFormProps {
  initialData?: any;
  onSubmit: (data: AdminFormValues) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export default function AdminForm({ initialData, onSubmit, isLoading, isEdit }: AdminFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: initialData || {
      role: "ADMIN",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input
              {...register("name")}
              placeholder="e.g. John Doe"
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all",
                errors.name && "border-red-200 ring-2 ring-red-50"
              )}
            />
          </div>
          {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.name.message}</p>}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Username</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input
              {...register("username")}
              placeholder="e.g. johndoe"
              disabled={isEdit}
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                errors.username && "border-red-200 ring-2 ring-red-50"
              )}
            />
          </div>
          {errors.username && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input
              {...register("email")}
              type="email"
              placeholder="e.g. john@example.com"
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all",
                errors.email && "border-red-200 ring-2 ring-red-50"
              )}
            />
          </div>
          {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input
              {...register("phone")}
              placeholder="e.g. +91 98765 43210"
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all",
                errors.phone && "border-red-200 ring-2 ring-red-50"
              )}
            />
          </div>
          {errors.phone && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Physical Address</label>
        <div className="relative group">
          <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
          <textarea
            {...register("address")}
            placeholder="e.g. 123 Street, City, Country"
            rows={3}
            className={cn(
              "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all",
              errors.address && "border-red-200 ring-2 ring-red-50"
            )}
          />
        </div>
        {errors.address && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Access Role</label>
          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <select
              {...register("role")}
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all appearance-none",
                errors.role && "border-red-200 ring-2 ring-red-50"
              )}
            >
              <option value="ADMIN">Regular Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {errors.role && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.role.message}</p>}
        </div>

        {/* Password (Only required for new admins) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
            {isEdit ? "New Password (Optional)" : "Password"}
          </label>
          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors" size={18} />
            <input
              {...register("password")}
              type="password"
              placeholder={isEdit ? "Leave blank to keep same" : "••••••••"}
              required={!isEdit}
              className={cn(
                "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:bg-white transition-all",
                errors.password && "border-red-200 ring-2 ring-red-50"
              )}
            />
          </div>
          {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.password.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary-green text-white font-bold rounded-2xl hover:bg-primary-green-dark transition-all shadow-lg shadow-primary-green/20 disabled:opacity-50"
      >
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        {isEdit ? "Update Administrative Account" : "Create Administrative Account"}
      </button>
    </form>
  );
}

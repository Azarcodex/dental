"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePatientSchema } from "@/modules/patient/patient.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Loader2, User, Phone, Mail } from "lucide-react";

interface PatientFormProps {
  onSuccess: (patient?: any) => void;
  initialPhone?: string;
}

export default function PatientForm({ onSuccess, initialPhone }: PatientFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(CreatePatientSchema),
    defaultValues: {
      fullName: "",
      gender: "OTHER",
      age: 0,
      phone: initialPhone || "",
      email: "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post("/patient", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient registered successfully");
      onSuccess(response.data.data);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register patient");
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User size={16} className="text-gray-400" /> Full Name
          </label>
          <input
            {...register("fullName")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none transition-all placeholder:text-gray-400 text-black font-semibold"
            placeholder="John Doe"
          />
          <div className="min-h-[20px]">
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message as string}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            <select
              {...register("gender")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black font-semibold"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Age</label>
            <input
              type="number"
              {...register("age", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Phone size={16} className="text-gray-400" /> Phone Number
          </label>
          <input
            {...register("phone")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none transition-all placeholder:text-gray-400 text-black font-semibold"
            placeholder="07xxxxxxxx"
          />
          <div className="min-h-[20px]">
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message as string}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail size={16} className="text-gray-400" /> Email (optional)
          </label>
          <input
            {...register("email")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none transition-all placeholder:text-gray-400 text-black font-semibold"
            placeholder="john@example.com"
          />
          <div className="min-h-[20px]">
            {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-primary-green text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-green-dark transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary-green/10"
        >
          {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
          Complete Patient Registration
        </button>
      </div>
    </form>
  );
}

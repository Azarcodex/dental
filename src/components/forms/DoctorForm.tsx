import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorFormSchema } from "@/modules/doctor/doctor.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Loader2, UserSquare2, Plus, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface DoctorFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export default function DoctorForm({ onSuccess, initialData }: DoctorFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: initialData ? {
      ...initialData,
      dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "1990-01-01",
    } : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dob: "1990-01-01",
      specialization: "",
      department: "",
      consultationFee: 1000,
      status: "ACTIVE",
      profilePhoto: "",
    }
  });

  const photoUrl = watch("profilePhoto");

  // Ensure form resets when switching between doctors
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "1990-01-01",
        profilePhoto: initialData.profilePhoto || "",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dob: "1990-01-01",
        specialization: "",
        department: "",
        consultationFee: 1000,
        status: "ACTIVE",
        profilePhoto: "",
      });
    }
  }, [initialData, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setValue("profilePhoto", response.data.url);
        toast.success("Photo uploaded successfully");
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        profilePhoto: data.profilePhoto || null,
      };

      if (initialData?.id) {
        return axiosInstance.put(`/doctors/${initialData.id}`, payload);
      }
      return axiosInstance.post("/doctors", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success(initialData ? "Doctor updated" : "Doctor added successfully");
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save doctor");
    }
  });

  const onSubmit = (data: any) => {
    const result = DoctorFormSchema.safeParse(data);
    
    if (!result.success) {
      console.error("Manual Validation Errors:", result.error.flatten());
      const firstError = result.error.issues[0];
      toast.error(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    mutation.mutate(result.data);
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Section: Avatar & Primary Info */}
      <div className="flex items-start gap-6 pb-6 border-b border-gray-100/60">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative group flex-shrink-0 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center ring-1 ring-gray-100 group-hover:ring-primary-green/30 transition-all">
            {photoUrl ? (
              <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <UserSquare2 size={28} className="text-gray-200" />
            )}
            
            {/* Loading/Hover Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {isUploading ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary-green text-white p-1 rounded-lg shadow-lg border-2 border-white">
            <Plus size={12} />
          </div>
        </div>

        <div className="flex-1 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
              <input
                {...register("firstName")}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
              <input
                {...register("lastName")}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] text-slate-400 font-medium">
              {photoUrl ? "Click photo to change profile picture" : "Click to upload profile photo"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content: Two Columns for tighter layout */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {/* Contact info group */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <input
              {...register("email")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
              placeholder="jane@clinic.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input
              {...register("phone")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
              placeholder="07xxxxxxxx"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOB</label>
              <input
                type="date"
                {...register("dob")}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black"
              />
            </div>
          </div>
        </div>

        {/* Medical info group */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization</label>
            <input
              {...register("specialization")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
              placeholder="e.g. Cardiology"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
            <input
              {...register("department")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
              placeholder="e.g. Heart & Vascular"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee (₹)</label>
            <input
              type="number"
              {...register("consultationFee", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-green/5 focus:border-primary-green transition-all font-medium text-[13px] text-black placeholder:text-gray-400"
              placeholder="1000"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-3 border-t border-gray-50 mt-4">
        <button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2 text-[13px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || isUploading}
          className="bg-primary-green text-white px-8 py-2.5 rounded-xl font-bold text-[13px] hover:bg-primary-green-dark transition-all shadow-md shadow-primary-green/10 active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {(mutation.isPending || isUploading) && <Loader2 size={14} className="animate-spin" />}
          {initialData ? "Save Changes" : "Create Profile"}
        </button>
      </div>
    </form>
  );
}

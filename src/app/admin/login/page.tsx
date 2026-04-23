"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Handle browser back button or direct navigation if already logged in
  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post("/admin/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Login successful");
      login(data.admin);
    },
    onError: (error: any) => {
      toast.error(error.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Top-left image positioning as requested */}
        <div className="relative h-24 w-full">
          <div className="absolute top-4 left-6">
            <Image
              src="/Main.jpeg"
              alt="Clinic Logo"
              width={100}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="px-8 pb-10 pt-2">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Please enter your details to access the admin portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block marker:">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                  placeholder="name@clinic.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-blue transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-green/30 disabled:opacity-70 shadow-lg",
                "bg-gradient-to-r from-primary-green to-primary-green-dark hover:from-primary-green-dark hover:to-primary-green-dark"
              )}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Logging in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

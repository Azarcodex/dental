"use client";

import { Bell, Settings, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="h-20 bg-[#000000] border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40 print:hidden">
      {/* Branding / Logo */}
      <div className="flex items-center gap-8">
        <img 
          src="/logo.jpg" 
          alt="Clinic Logo" 
          className="h-16 md:h-18 w-auto object-contain mix-blend-screen brightness-110" 
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <div className="bg-[#C49228]/10 text-[#C49228] w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-none mb-1">
                {user?.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Admin
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-white/5 mb-1">
                  <p className="text-sm font-semibold text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all">
                  <Settings size={18} className="text-slate-400" />
                  Account Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all">
                  <HelpCircle size={18} className="text-slate-400" />
                  Technical Support
                </button>

                <div className="h-px bg-white/5 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-950/20 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

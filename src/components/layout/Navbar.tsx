"use client";

import Image from "next/image";
import { Bell, Settings, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40 print:hidden">
      {/* Branding / Logo */}
      <div className="flex items-center gap-8">
        <Image
          src="/Main.jpeg"
          alt="ADAMS Clinic Logo"
          width={120}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="bg-primary-blue/10 text-primary-blue w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                {user?.name}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
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
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all">
                  <Settings size={18} className="text-gray-400" />
                  Account Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all">
                  <HelpCircle size={18} className="text-gray-400" />
                  Technical Support
                </button>

                <div className="h-px bg-gray-50 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
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

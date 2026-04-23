"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, ShieldCheck, LogOut, Settings, Bell, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Admin Account</h1>
        <p className="text-gray-500">Manage your administrative credentials and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-primary-green/10 text-primary-green flex items-center justify-center font-bold text-3xl">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-green bg-primary-green/5 px-2.5 py-1 rounded-full border border-primary-green/10">
                    {user?.role}
                  </span>
                  <span className="text-gray-300"> • </span>
                  <span className="text-xs font-medium text-gray-500">Member since April 2024</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </p>
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                  <ShieldCheck size={12} /> Security Status
                </p>
                <div className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Primary Admin Verified
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your security key</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">System & booking alerts</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-gray-600 group">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-gray-400" />
                <span className="text-sm font-semibold">Preferences</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary-green transition-colors" />
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-all text-red-600 group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="text-sm font-bold">Sign Out</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-red-500 transition-colors" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white space-y-4">
            <h4 className="font-bold text-sm">Need Help?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              If you encounter any issues with the dashboard or booking engine, please contact the support team.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex bg-[#f8fafc] min-h-screen">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

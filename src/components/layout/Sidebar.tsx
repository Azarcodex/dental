"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarPlus, 
  UserCircle,
  Menu,
  ChevronLeft,
  Clock
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "New Appointment", href: "/admin/booking", icon: CalendarPlus },
  { name: "Doctors", href: "/admin/doctors", icon: UserSquare2 },
  { name: "Slots", href: "/admin/slots", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-100 rounded-full p-1 shadow-sm hover:bg-gray-50 z-50 transition-colors"
      >
        {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Profile Summary if expanded */}
      <div className="p-6">
        <div className={cn(
          "flex items-center gap-3 transition-opacity duration-200",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center text-primary-green shrink-0">
            <UserCircle size={24} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin Portal</p>
              <p className="text-xs text-gray-500 truncate">ADAMS Clinic</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                active 
                  ? "bg-primary-green/10 text-primary-green" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon 
                size={22} 
                className={cn(
                  "shrink-0",
                  active ? "text-primary-green" : "group-hover:text-gray-900"
                )} 
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
              
              {/* Active Indicator Line */}
              {active && !collapsed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-green rounded-r-full" />
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Version Info */}
      {!collapsed && (
        <div className="p-6">
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">v1.2.0-prod</p>
        </div>
      )}
    </div>
  );
}

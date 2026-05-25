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
  Clock,
  ShieldCheck,
  LogOut,
  Star,
  Image as ImageIcon
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "New Appointment", href: "/admin/booking", icon: CalendarPlus },
  { name: "Doctors", href: "/admin/doctors", icon: UserSquare2 },
  { name: "Slots", href: "/admin/slots", icon: Clock },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
];



export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredMenuItems = useMemo(() => {
    const items = [...menuItems];
    if (user?.role === "SUPER_ADMIN") {
      items.push({ name: "Manage Admins", href: "/admin/management", icon: ShieldCheck });
    }
    return items;
  }, [user]);

  return (
    <div 
      className={cn(
        "h-screen bg-black border-r border-zinc-900 flex flex-col transition-all duration-300 relative print:hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-black text-white border border-zinc-800 rounded-full p-1 shadow-sm hover:bg-zinc-900 z-50 transition-colors"
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
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin Portal"}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{user?.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                active 
                  ? "bg-primary-green/20 text-primary-green" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon 
                size={22} 
                className={cn(
                  "shrink-0",
                  active ? "text-primary-green" : "group-hover:text-white"
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

      {/* Logout & Version Info */}
      <div className="p-3 border-t border-zinc-900 space-y-1">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-red-500 hover:bg-red-950/30",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={22} className="shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm">Sign Out</span>
          )}
          {collapsed && (
            <div className="absolute left-16 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] whitespace-nowrap">
              Sign Out
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="px-3 pt-4">
            <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">v1.2.0-prod</p>
          </div>
        )}
      </div>
    </div>
  );
}

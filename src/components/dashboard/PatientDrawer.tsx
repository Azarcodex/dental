import React from "react";
import { X, User, Phone, Calendar, Info, Clock, Stethoscope } from "lucide-react";
import { cn, formatTimeTo12h } from "@/lib/utils";

interface PatientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  appointment: any;
}

export const PatientDrawer: React.FC<PatientDrawerProps> = ({ isOpen, onClose, patient, appointment }) => {
  if (!patient) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] transform transition-transform duration-300 ease-out p-0",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{patient.fullName}</h3>
            <p className="text-sm font-medium text-primary-green">{patient.displayId || "P-???"}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-88px)]">
          {/* Patient Info Section */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-400" /> {patient.phone}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Age / Gender</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {patient.age}y • {patient.gender}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 col-span-2">
                <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                <p className="text-sm font-bold text-red-600">
                  {patient.bloodGroup || "Not specified"}
                </p>
              </div>
            </div>
          </section>

          {/* Current Appointment Section */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Current Appointment
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-primary-green/5 rounded-2xl border border-primary-green/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-green shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Token Number</p>
                    <p className="text-sm font-bold text-gray-900">{appointment?.token || "---"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Slot</p>
                  <p className="text-sm font-bold text-gray-900">{formatTimeTo12h(appointment?.startTime)}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-start gap-3">
                  <Stethoscope size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Doctor</p>
                    <p className="text-sm font-semibold text-gray-900">
                      Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">
                      {appointment?.specialization}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Reason / Department</p>
                    <p className="text-sm font-semibold text-gray-900">{appointment?.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

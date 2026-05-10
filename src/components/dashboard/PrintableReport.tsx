import { formatTimeTo12h } from "@/lib/utils";

interface PrintableReportProps {
  appointments: any[];
  selectedDate: string;
  selectedDoctor: string;
  selectedStatus: string;
  doctors: any[];
}

export function PrintableReport({
  appointments,
  selectedDate,
  selectedDoctor,
  selectedStatus,
  doctors,
}: PrintableReportProps) {
  const currentDate = new Date().toLocaleString();
  const doctorName =
    selectedDoctor && doctors
      ? doctors.find((d: any) => d.id === selectedDoctor)?.firstName + " " + (doctors.find((d: any) => d.id === selectedDoctor)?.lastName || "")
      : "All Doctors";
  
  const statusLabel = selectedStatus === "ALL" ? "All Statuses" : selectedStatus;

  return (
    <div className="bg-white text-black font-sans p-8 w-full max-w-full">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">ADAMS Clinic</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Filtered Bookings Report</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated On</p>
          <p className="text-sm font-semibold text-gray-900">{currentDate}</p>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="flex flex-wrap gap-6 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date</p>
          <p className="text-sm font-bold text-gray-900">{selectedDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Doctor</p>
          <p className="text-sm font-bold text-gray-900">
            {selectedDoctor ? `Dr. ${doctorName}` : "All Doctors"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm font-bold text-gray-900">{statusLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Bookings</p>
          <p className="text-sm font-bold text-gray-900">{appointments?.length || 0}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Token</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Time</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Patient</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Phone</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Doctor</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Type</th>
            <th className="py-3 px-2 text-[11px] font-black text-gray-900 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!appointments || appointments.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-sm font-semibold text-gray-500">
                No bookings found for the applied filters.
              </td>
            </tr>
          ) : (
            appointments.map((app: any) => (
              <tr key={app.id} className="break-inside-avoid">
                <td className="py-3 px-2 whitespace-nowrap text-sm font-bold text-gray-900">
                  {app.token || "---"}
                </td>
                <td className="py-3 px-2 whitespace-nowrap text-sm text-gray-600 font-semibold">
                  {formatTimeTo12h(app.startTime)}
                </td>
                <td className="py-3 px-2 text-sm font-bold text-gray-900">
                  {app.patient.fullName}
                </td>
                <td className="py-3 px-2 text-sm text-gray-600">
                  {app.patient.phone}
                </td>
                <td className="py-3 px-2 text-sm text-gray-800 font-semibold">
                  Dr. {app.doctor.firstName} {app.doctor.lastName || ""}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs font-bold uppercase tracking-tight text-gray-600">
                    {app.bookingType}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-800">
                    {app.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

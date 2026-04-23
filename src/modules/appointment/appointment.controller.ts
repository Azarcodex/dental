import { NextResponse } from "next/server";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentSchema } from "./appointment.types";
import { apiHandler } from "../../lib/apiHandler";

const appointmentService = new AppointmentService();

export const createAppointmentHandler = apiHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = CreateAppointmentSchema.parse(body);

  const appointment = await appointmentService.createAppointment(validatedData);

  return NextResponse.json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  }, { status: 201 });
});

export const cancelAppointmentHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) throw new Error("Appointment ID is required");

  await appointmentService.cancelAppointment(id);

  return NextResponse.json({
    success: true,
    message: "Appointment cancelled successfully",
  });
});

export const getDashboardAppointmentsHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date") || new Date().toISOString().split('T')[0];
  const doctorId = url.searchParams.get("doctorId") || undefined;
  const status = url.searchParams.get("status") || "ALL";

  const appointments = await appointmentService.getDashboardData({
    date: dateStr,
    doctorId,
    status,
  });

  return NextResponse.json({
    success: true,
    data: appointments,
  });
});

export const getDashboardStatsHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date") || new Date().toISOString().split('T')[0];
  const doctorId = url.searchParams.get("doctorId") || undefined;

  const stats = await appointmentService.getDashboardStats(dateStr, doctorId);

  return NextResponse.json({
    success: true,
    data: stats,
  });
});

export const updateStatusHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const id = url.pathname.split("/").slice(-2, -1)[0]; // /api/appointments/[id]/status
  const body = await req.json();
  const { status } = body;

  if (!id || !status) throw new Error("ID and status are required");

  const updated = await appointmentService.updateStatus(id, status);

  return NextResponse.json({
    success: true,
    data: updated,
  });
});

export const getByPatientHandler = apiHandler(async (req: Request, context: any) => {
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");

  if (!patientId) {
    // If no patient ID is provided, fallback to the dashboard view 
    // (which uses query params like date/doctorId) instead of crashing.
    return getDashboardAppointmentsHandler(req as any, context);
  }

  const appointments = await appointmentService.getAppointmentsByPatient(patientId);

  return NextResponse.json({
    success: true,
    data: appointments,
  });
});

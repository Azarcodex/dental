import { createAppointmentHandler, getByPatientHandler } from "@/modules/appointment/appointment.controller";

export const POST = createAppointmentHandler;
export const GET = getByPatientHandler;

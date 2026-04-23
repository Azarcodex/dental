import { getDashboardAppointmentsHandler } from "@/modules/appointment/appointment.controller";

export async function GET(req: any, ctx: any) {
  return getDashboardAppointmentsHandler(req, ctx);
}

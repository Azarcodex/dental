import { getDashboardStatsHandler } from "@/modules/appointment/appointment.controller";

export async function GET(req: any, ctx: any) {
  return getDashboardStatsHandler(req, ctx);
}

import { getSlotsHandler } from "@/modules/doctor/doctor.controller";

export async function GET(req: any, ctx: any) {
  return getSlotsHandler(req, ctx);
}

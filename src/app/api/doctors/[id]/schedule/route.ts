import { getDoctorByIdHandler, saveCompleteScheduleHandler } from "@/modules/doctor/doctor.controller";

export async function GET(req: any, ctx: any) {
  return getDoctorByIdHandler(req, ctx);
}

export async function POST(req: any, ctx: any) {
  return saveCompleteScheduleHandler(req, ctx);
}

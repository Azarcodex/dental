import { createDoctorHandler, getAllDoctorsHandler } from "@/modules/doctor/doctor.controller";

export async function GET(req: any, ctx: any) {
  return getAllDoctorsHandler(req, ctx);
}

export async function POST(req: any, ctx: any) {
  return createDoctorHandler(req, ctx);
}

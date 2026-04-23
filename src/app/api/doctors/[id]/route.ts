import { getDoctorByIdHandler, updateDoctorHandler } from "@/modules/doctor/doctor.controller";

export async function GET(req: any, ctx: any) {
  return getDoctorByIdHandler(req, ctx);
}

export async function PUT(req: any, ctx: any) {
  return updateDoctorHandler(req, ctx);
}

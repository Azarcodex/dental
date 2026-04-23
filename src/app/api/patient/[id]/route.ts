import { getPatientByIdHandler } from "@/modules/patient/patient.controller";

export async function GET(req: any, ctx: any) {
  return getPatientByIdHandler(req, ctx);
}

import { getPatientsHandler } from "@/modules/patient/patient.controller";

export async function GET(req: any, ctx: any) {
  return getPatientsHandler(req, ctx);
}

import { createPatientHandler, getPatientsHandler } from "@/modules/patient/patient.controller";

export async function GET(req: any, ctx: any) {
  return getPatientsHandler(req, ctx);
}

export async function POST(req: any, ctx: any) {
  return createPatientHandler(req, ctx);
}

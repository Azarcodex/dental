import { addExceptionHandler } from "@/modules/doctor/doctor.controller";

export async function POST(req: any, ctx: any) {
  return addExceptionHandler(req, ctx);
}

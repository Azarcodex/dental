import { addBlockHandler } from "@/modules/doctor/doctor.controller";

export async function POST(req: any, ctx: any) {
  return addBlockHandler(req, ctx);
}

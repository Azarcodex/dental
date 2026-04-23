import { updateStatusHandler } from "@/modules/appointment/appointment.controller";

export async function PATCH(req: any, ctx: any) {
  return updateStatusHandler(req, ctx);
}

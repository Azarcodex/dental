import { z } from "zod";

export const LoginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
});

export type LoginAdminInput = z.infer<typeof LoginAdminSchema>;
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;

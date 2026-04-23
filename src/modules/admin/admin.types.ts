import { z } from "zod";
import { AdminRole } from "../../prisma-client";

export const CreateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(AdminRole).optional(),
});

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;

export const LoginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginAdminInput = z.infer<typeof LoginAdminSchema>;

export interface AdminResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

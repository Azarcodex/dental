import { z } from "zod";
import { AdminRole } from "../../prisma-client";

export const CreateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(AdminRole).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;

export const LoginAdminSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginAdminInput = z.infer<typeof LoginAdminSchema>;

export const UpdateAdminCredentialsSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type UpdateAdminCredentialsInput = z.infer<typeof UpdateAdminCredentialsSchema>;

export const UpdateAdminProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type UpdateAdminProfileInput = z.infer<typeof UpdateAdminProfileSchema>;

export interface AdminResponse {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: AdminRole;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

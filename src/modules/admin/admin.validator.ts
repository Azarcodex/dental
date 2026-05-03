import { z } from "zod";

export const LoginAdminSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateAdminCredentialsSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const UpdateAdminProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type LoginAdminInput = z.infer<typeof LoginAdminSchema>;
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;
export type UpdateAdminCredentialsInput = z.infer<typeof UpdateAdminCredentialsSchema>;
export type UpdateAdminProfileInput = z.infer<typeof UpdateAdminProfileSchema>;

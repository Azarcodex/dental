import { z } from "zod";

export const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").toLowerCase(),
  email: z.string().email("Invalid email address").nullable().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").nullable().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").nullable().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type AdminFormValues = z.infer<typeof adminSchema>;

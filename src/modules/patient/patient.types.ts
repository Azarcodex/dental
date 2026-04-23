import { z } from "zod";

export const PatientSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.string(),
  age: z.number().int().positive(),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().optional(),
});

export const CreatePatientSchema = PatientSchema;
export const UpdatePatientSchema = PatientSchema.partial();

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type PatientInput = z.infer<typeof PatientSchema>;

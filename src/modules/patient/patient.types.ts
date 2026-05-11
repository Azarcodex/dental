import { z } from "zod";

export const PatientSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.string(),
  phone: z.string().min(10, "Valid phone number is required"),
});

export const CreatePatientSchema = PatientSchema;
export const UpdatePatientSchema = PatientSchema.partial();

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type PatientInput = z.infer<typeof PatientSchema>;

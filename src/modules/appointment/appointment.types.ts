import { z } from "zod";
import { PatientSchema } from "../patient/patient.types";

export const CreateAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientData: PatientSchema, // Include full patient data for getOrCreate logic
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  bookingType: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

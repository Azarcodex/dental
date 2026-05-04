import { z } from "zod";

export const CreateDoctorSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.string(),
  profilePhoto: z.string().nullable().optional(),
  specialization: z.string().min(2, "Specialization is required"),
  department: z.string().min(2, "Department is required"),
  consultationFee: z.number().positive(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const UpdateDoctorSchema = CreateDoctorSchema.partial();

// A dedicated schema for the frontend form to avoid issues with Zod transformations 
// during the react-hook-form lifecycle.
export const DoctorFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.string(),
  profilePhoto: z.string().nullable().optional(),
  specialization: z.string().min(2, "Specialization is required"),
  department: z.string().min(2, "Department is required"),
  consultationFee: z.number().positive(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const CreateScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().min(1).default(15),
});

export const CreateBlockSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const CreateExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((val) => new Date(val)),
  isFullDay: z.boolean().default(false),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reason: z.string().optional(),
});

export const SlotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>;
export type SlotQueryInput = z.infer<typeof SlotQuerySchema>;
export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
export type CreateBlockInput = z.infer<typeof CreateBlockSchema>;
export type CreateExceptionInput = z.infer<typeof CreateExceptionSchema>;

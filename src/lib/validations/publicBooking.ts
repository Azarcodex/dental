import { z } from "zod";

export const publicBookingSchema = z.object({
  fullName: z.string()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should contain letters only")
    .nonempty("Full name is required"),
  
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Digits only"),
    
  email: z.string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
    
  gender: z.string().nonempty("Please select your gender"),
  
  age: z.union([
    z.number().min(1, "Age must be at least 1").max(120, "Please enter a valid age"),
    z.nan()
  ]).transform((val) => isNaN(val) ? undefined : val).optional(),
    
  specialization: z.string().nonempty("Please select a specialization"),
  
  doctorId: z.string().nonempty("Please select a doctor"),
  
  date: z.string().nonempty("Please select a preferred date"),
  
  slot: z.string().nonempty("Please select a time slot"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

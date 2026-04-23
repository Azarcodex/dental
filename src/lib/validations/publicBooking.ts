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
    .nonempty("Email is required"),
    
  dob: z.string()
    .nonempty("Date of birth is required")
    .refine((val) => {
      const birthDate = new Date(val);
      const today = new Date();
      return birthDate < today;
    }, "Please enter a valid date of birth")
    .refine((val) => {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 1;
    }, "Please enter a valid date of birth (min 1 year)"),
    
  gender: z.string().nonempty("Please select your gender"),
  
  specialization: z.string().nonempty("Please select a specialization"),
  
  doctorId: z.string().nonempty("Please select a doctor"),
  
  date: z.string().nonempty("Please select a preferred date"),
  
  slot: z.string().nonempty("Please select a time slot"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

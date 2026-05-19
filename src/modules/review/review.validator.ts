import { z } from "zod";

export const CreateReviewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().min(1, "Rating must be selected").max(5, "Rating cannot exceed 5 stars"),
});

export const UpdateReviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

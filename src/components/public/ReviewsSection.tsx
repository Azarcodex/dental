"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axios";
import { Star, User, MessageSquare, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { cn } from "@/lib/utils";

const reviewFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Review message is required"),
  rating: z.number().min(1, "Please select a rating of at least 1 star").max(5),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewsSection() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      description: "",
      rating: 0,
    },
  });

  const watchRating = watch("rating");

  // Fetch approved reviews
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/reviews");
      return data.data;
    },
    staleTime: 0, // Always load fresh data
  });


  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: ReviewFormValues) => {
      return axiosInstance.post("/reviews", payload);
    },
    onSuccess: () => {
      toast.success("Review submitted! It will be visible once approved by our team.");
      reset();
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit review. Please try again.");
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    submitMutation.mutate(data);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              i < rating
                ? "text-primary-green fill-primary-green drop-shadow-[0_0_6px_rgba(196,146,40,0.4)]"
                : "text-white/10"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="reviews" className="pt-32 pb-28 bg-transparent overflow-hidden relative">
      <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <span className="section-subtitle">Testimonials</span>
          <h2 className="section-title">What Our Patients Say</h2>
          <p className="text-slate-400 font-medium max-w-xl mx-auto">
            Discover the experiences of our guests and how we craft healthy, confident smiles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Patient Stories
            </h3>


            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card p-6 rounded-[30px] animate-pulse space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-white/10 rounded w-1/4" />
                      <div className="h-4 bg-white/10 rounded w-1/6" />
                    </div>
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-card p-12 rounded-[40px] text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">No reviews yet</p>
                  <p className="text-sm text-slate-400">Be the first to share your experience with us!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {reviews.map((review: any, index: number) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="glass-card p-8 rounded-[35px] border border-white/5 space-y-4 hover:border-primary-green/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 text-primary-green flex items-center justify-center font-black text-sm uppercase border border-white/10">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-none mb-1">{review.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <Calendar size={10} />
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                        {review.description}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Review Submission Form */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
              <div className="bg-white/[0.01] border-b border-white/5 p-8 text-white">
                <h3 className="text-2xl font-black">Write a Review</h3>
                <p className="text-slate-400 font-medium text-xs mt-1">
                  Your feedback helps us continuously elevate our client care.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      {...register("name")}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-14 pr-5 py-4 bg-black/50 border border-white/10 rounded-[20px] outline-none focus:border-primary-green focus:bg-white/5 transition-all font-bold text-white placeholder:text-slate-600 text-sm"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.name.message}</p>}
                </div>

                {/* Rating selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Rating</label>
                  <div className="bg-black/50 border border-white/10 rounded-[20px] p-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 transition-all duration-300">

                      {watchRating === 1 && "😢 Terrible"}
                      {watchRating === 2 && "🙁 Bad"}
                      {watchRating === 3 && "😐 Okay"}
                      {watchRating === 4 && "🙂 Good"}
                      {watchRating === 5 && "😍 Excellent!"}
                      {watchRating === 0 && "Select Stars"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue("rating", star, { shouldValidate: true })}
                          className="p-1 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                          <Star
                            size={22}
                            className={cn(
                              "transition-all duration-300",
                              star <= watchRating
                                ? "text-primary-green fill-primary-green drop-shadow-[0_0_8px_rgba(196,146,40,0.5)]"
                                : "text-slate-600 hover:text-primary-green"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.rating && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.rating.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Review</label>
                  <textarea
                    {...register("description")}
                    placeholder="Describe your treatment experience..."
                    rows={4}
                    className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-[20px] outline-none focus:border-primary-green focus:bg-white/5 transition-all font-bold text-white placeholder:text-slate-600 text-sm resize-none"
                  />
                  {errors.description && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.description.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn-premium-primary w-full flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="animate-spin text-black" size={20} />
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

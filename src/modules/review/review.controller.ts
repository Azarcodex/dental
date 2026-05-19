import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { ReviewService } from "./review.service";
import { CreateReviewSchema, UpdateReviewStatusSchema } from "./review.validator";
import { authenticateAdmin } from "@/lib/middlewares/authMiddleware";

const reviewService = new ReviewService();

// Public: Submit Review
export const submitReviewHandler = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validated = CreateReviewSchema.parse(body);
  const review = await reviewService.submitReview(validated);
  return NextResponse.json({ success: true, data: review }, { status: 201 });
});

// Public: Get Approved Reviews
export const getApprovedReviewsHandler = apiHandler(async () => {
  const reviews = await reviewService.getApprovedReviews();
  return NextResponse.json({ success: true, data: reviews });
});

// Admin: Get All/Filtered Reviews
export const getAdminReviewsHandler = apiHandler(async (req: NextRequest) => {
  await authenticateAdmin(req);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  
  const reviews = await reviewService.getAllReviewsForAdmin(status ? { status } : undefined);
  return NextResponse.json({ success: true, data: reviews });
});

// Admin: Update Review Status
export const updateReviewStatusHandler = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin(req);
  const { id } = await params;
  const body = await req.json();
  const { status } = UpdateReviewStatusSchema.parse(body);

  const updated = await reviewService.updateReviewStatus(id, status);
  return NextResponse.json({ success: true, data: updated });
});

// Admin: Delete Review
export const deleteReviewHandler = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin(req);
  const { id } = await params;

  await reviewService.deleteReview(id);
  return NextResponse.json({ success: true, message: "Review deleted successfully" });
});

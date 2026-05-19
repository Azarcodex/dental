import { submitReviewHandler, getApprovedReviewsHandler } from "@/modules/review/review.controller";

export const POST = submitReviewHandler;
export const GET = getApprovedReviewsHandler;

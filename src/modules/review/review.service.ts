import { ReviewRepository } from "./review.repository";

export class ReviewService {
  private reviewRepository = new ReviewRepository();

  async submitReview(data: { name: string; description: string; rating: number }) {
    return this.reviewRepository.create(data);
  }

  async getApprovedReviews() {
    return this.reviewRepository.getApproved();
  }

  async getAllReviewsForAdmin(filters?: { status?: string }) {
    return this.reviewRepository.getAll(filters);
  }

  async updateReviewStatus(id: string, status: "pending" | "approved" | "rejected") {
    return this.reviewRepository.updateStatus(id, status);
  }

  async deleteReview(id: string) {
    return this.reviewRepository.delete(id);
  }
}

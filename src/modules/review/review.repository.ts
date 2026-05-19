import prisma from "@/lib/prisma";

export class ReviewRepository {
  async create(data: { name: string; description: string; rating: number }) {
    return prisma.review.create({
      data: {
        ...data,
        status: "pending",
      },
    });
  }

  async getApproved() {
    return prisma.review.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAll(filters?: { status?: string }) {
    return prisma.review.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: "pending" | "approved" | "rejected") {
    return prisma.review.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
    });
  }
}

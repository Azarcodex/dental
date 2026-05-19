import prisma from "@/lib/prisma";

export class GalleryRepository {
  async create(data: { imageUrl: string; publicId: string }) {
    return prisma.gallery.create({
      data,
    });
  }

  async getAll() {
    return prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string) {
    return prisma.gallery.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return prisma.gallery.findUnique({
      where: { id },
    });
  }
}

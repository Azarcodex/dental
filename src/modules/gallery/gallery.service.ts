import { GalleryRepository } from "./gallery.repository";
import { deleteFromCloudinary } from "@/lib/upload.service";
import { AppError } from "@/lib/apiHandler";

export class GalleryService {
  private galleryRepository = new GalleryRepository();

  async uploadImage(data: { imageUrl: string; publicId: string }) {
    return this.galleryRepository.create(data);
  }

  async getAllImages() {
    return this.galleryRepository.getAll();
  }

  async deleteImage(id: string) {
    const image = await this.galleryRepository.findById(id);
    if (!image) {
      throw new AppError("Image not found", 404);
    }
    
    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(image.publicId);
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }

    return this.galleryRepository.delete(id);
  }
}

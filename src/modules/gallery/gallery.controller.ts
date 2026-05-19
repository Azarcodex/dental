import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { GalleryService } from "./gallery.service";
import { uploadToCloudinary } from "@/lib/upload.service";
import { authenticateAdmin } from "@/lib/middlewares/authMiddleware";

const galleryService = new GalleryService();

// Admin: Upload gallery image(s)
export const uploadGalleryImagesHandler = apiHandler(async (req: NextRequest) => {
  await authenticateAdmin(req);
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  
  if (files.length === 0) {
    const singleFile = formData.get("file") as File;
    if (singleFile) {
      files.push(singleFile);
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ success: false, message: "No files provided" }, { status: 400 });
  }

  const uploadedRecords = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await uploadToCloudinary(buffer, "gallery");
    
    const record = await galleryService.uploadImage({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
    
    uploadedRecords.push(record);
  }

  return NextResponse.json({ success: true, data: uploadedRecords }, { status: 201 });
});

// Public/Admin: Get all gallery images
export const getGalleryImagesHandler = apiHandler(async () => {
  const images = await galleryService.getAllImages();
  return NextResponse.json({ success: true, data: images });
});

// Admin: Delete gallery image
export const deleteGalleryImageHandler = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await authenticateAdmin(req);
    const { id } = await params;

    await galleryService.deleteImage(id);
    return NextResponse.json({ success: true, message: "Gallery image deleted successfully" });
  }
);

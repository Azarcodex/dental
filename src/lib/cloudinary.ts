import { v2 as cloudinary } from "cloudinary";

// Parse cloud name from CLOUDINARY_URL if CLOUDINARY_CLOUD_NAME is not provided
// URL format: cloudinary://api_key:api_secret@cloud_name
const extractCloudName = (url: string | undefined) => {
  if (!url) return undefined;
  const parts = url.split('@');
  return parts.length > 1 ? parts[1] : undefined;
};

cloudinary.config({
  cloud_name: extractCloudName(process.env.CLOUDINARY_URL) || "dwbwpsztz",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

export default cloudinary;

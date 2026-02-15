import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract public ID from URL
export const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;

    // Check if it's a Cloudinary URL
    if (!url.includes("cloudinary.com")) return null;

    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    // Get path after 'upload/v...'
    // Handling version number if present (starts with v)
    let publicIdParts = parts.slice(uploadIndex + 1);

    // Skip version if present
    if (publicIdParts.length > 0 && publicIdParts[0].startsWith("v")) {
      publicIdParts = publicIdParts.slice(1);
    }

    // Join remaining parts
    const publicIdWithExtension = publicIdParts.join("/");

    // Remove extension
    const publicId = publicIdWithExtension.split(".")[0];

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export const deleteImage = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};

export default cloudinary;

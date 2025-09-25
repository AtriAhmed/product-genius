/**
 * Example usage of the file upload utilities
 * This file demonstrates how to use the reusable upload functions
 * in different parts of your Next.js application
 */

import {
  uploadFile,
  uploadMultipleFiles,
  uploadProductMedia,
  uploadCategoryImage,
  uploadUserAvatar,
  getMediaType,
  isImageFile,
  isVideoFile,
  UploadOptions,
  UploadResult,
} from "@/lib/file-upload";

// Example 1: Basic file upload with custom options
export async function handleBasicFileUpload(file: File): Promise<UploadResult> {
  const options: UploadOptions = {
    directory: "uploads/documents",
    generateUniqueFilename: true,
    allowedExtensions: ["pdf", "doc", "docx", "txt"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  };

  try {
    const result = await uploadFile(file, options);
    console.log("File uploaded successfully:", result);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

// Example 2: Upload multiple files at once
export async function handleMultipleFileUploads(
  files: File[]
): Promise<UploadResult[]> {
  const options: UploadOptions = {
    directory: "uploads/gallery",
    subdirectory: "batch-upload",
    generateUniqueFilename: true,
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
    maxFileSize: 2 * 1024 * 1024, // 2MB per file
  };

  try {
    const results = await uploadMultipleFiles(files, options);
    console.log(`Successfully uploaded ${results.length} files`);
    return results;
  } catch (error) {
    console.error("Batch upload failed:", error);
    throw error;
  }
}

// Example 3: Product media upload (as used in the API route)
export async function handleProductMediaUpload(
  files: File[],
  productId: number
): Promise<{ url: string; type: "IMAGE" | "VIDEO"; size: number }[]> {
  const results: { url: string; type: "IMAGE" | "VIDEO"; size: number }[] = [];

  for (const file of files) {
    try {
      // Validate file type before upload
      if (!isImageFile(file) && !isVideoFile(file)) {
        throw new Error(`File ${file.name} is not a valid image or video`);
      }

      const uploadResult = await uploadProductMedia(file, productId);
      const mediaType = getMediaType(file);

      results.push({
        url: uploadResult.url,
        type: mediaType,
        size: uploadResult.size,
      });

      console.log(
        `Uploaded ${mediaType.toLowerCase()}: ${uploadResult.filename}`
      );
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return results;
}

// Example 4: Category image upload
export async function handleCategoryImageUpload(
  file: File,
  categoryId: number
): Promise<string> {
  try {
    // Validate it's an image file
    if (!isImageFile(file)) {
      throw new Error("Only image files are allowed for category images");
    }

    const result = await uploadCategoryImage(file, categoryId);
    console.log(`Category image uploaded: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error("Category image upload failed:", error);
    throw error;
  }
}

// Example 5: User avatar upload
export async function handleUserAvatarUpload(
  file: File,
  userId: number
): Promise<{ url: string; filename: string }> {
  try {
    // Validate it's an image file
    if (!isImageFile(file)) {
      throw new Error("Only image files are allowed for avatars");
    }

    const result = await uploadUserAvatar(file, userId);
    console.log(`Avatar uploaded for user ${userId}: ${result.url}`);

    return {
      url: result.url,
      filename: result.filename,
    };
  } catch (error) {
    console.error("Avatar upload failed:", error);
    throw error;
  }
}

// Example 6: Form data handling in API routes
export async function handleFormDataUploads(
  formData: FormData,
  entityId: number
) {
  const uploadResults: UploadResult[] = [];

  // Process all file entries in form data
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && key.startsWith("files_")) {
      try {
        const result = await uploadFile(value, {
          directory: "uploads/form-data",
          generateUniqueFilename: true,
          allowedExtensions: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
          maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        uploadResults.push(result);
      } catch (error) {
        console.error(`Failed to upload file from form data:`, error);
        throw error;
      }
    }
  }

  return uploadResults;
}

// Example 7: File validation before upload
export function validateFileBeforeUpload(file: File): {
  isValid: boolean;
  errors: string[];
  fileInfo: {
    name: string;
    size: string;
    type: string;
    isImage: boolean;
    isVideo: boolean;
  };
} {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/mov",
  ];

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
    );
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check filename
  if (!file.name || file.name.trim() === "") {
    errors.push("File must have a valid name");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      isImage: isImageFile(file),
      isVideo: isVideoFile(file),
    },
  };
}

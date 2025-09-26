import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export interface UploadOptions {
  directory: string;
  subdirectory?: string;
  generateUniqueFilename?: boolean;
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
}

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}

/**
 * Validates file extension against allowed extensions
 */
function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Generates a unique filename with timestamp
 */
function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split(".").pop();
  return [uuidv4().toString(), extension].filter(Boolean).join(".");
}

/**
 * Creates directory structure if it doesn't exist
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Uploads a single file to the specified directory
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  // Validate file size
  if (options.maxFileSize && file.size > options.maxFileSize) {
    throw new Error(
      `File size exceeds maximum limit of ${options.maxFileSize} bytes`
    );
  }

  // Validate file extension
  if (
    options.allowedExtensions &&
    !validateFileExtension(file.name, options.allowedExtensions)
  ) {
    throw new Error(
      `File type not allowed. Allowed extensions: ${options.allowedExtensions.join(
        ", "
      )}`
    );
  }

  // Generate filename
  const filename = options.generateUniqueFilename
    ? generateUniqueFilename(file.name)
    : file.name;

  // Build directory path
  const uploadDir = join(
    process.cwd(),
    options.directory,
    ...(options.subdirectory ? [options.subdirectory] : [])
  );

  console.log("-------------------- uploadDir --------------------");
  console.log(uploadDir);

  // Ensure directory exists
  await ensureDirectoryExists(uploadDir);

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  // Generate public URL
  const publicUrl = `/${options.directory}${
    options.subdirectory ? `/${options.subdirectory}` : ""
  }/${filename}`;

  return {
    url: publicUrl,
    filename,
    originalName: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Uploads multiple files to the specified directory
 */
export async function uploadMultipleFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw new Error(
        `Failed to upload file ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return results;
}

/**
 * Specific function for uploading product images
 */
export async function uploadProductMedia(
  file: File,
  productId: number
): Promise<UploadResult> {
  const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const allowedVideoExtensions = ["mp4", "webm", "mov", "avi"];
  const allowedExtensions = [
    ...allowedImageExtensions,
    ...allowedVideoExtensions,
  ];

  return uploadFile(file, {
    directory: "uploads/products",
    subdirectory: productId.toString(),
    generateUniqueFilename: true,
    allowedExtensions,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });
}

/**
 * Specific function for uploading category images
 */
export async function uploadCategoryImage(
  file: File,
  categoryId: number
): Promise<UploadResult> {
  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  return uploadFile(file, {
    directory: "uploads/categories",
    subdirectory: categoryId.toString(),
    generateUniqueFilename: true,
    allowedExtensions,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });
}

/**
 * Specific function for uploading user avatars
 */
export async function uploadUserAvatar(
  file: File,
  userId: number
): Promise<UploadResult> {
  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  return uploadFile(file, {
    directory: "uploads/avatars",
    subdirectory: userId.toString(),
    generateUniqueFilename: true,
    allowedExtensions,
    maxFileSize: 2 * 1024 * 1024, // 2MB
  });
}

/**
 * Utility function to get media type from file
 */
export function getMediaType(file: File): "IMAGE" | "VIDEO" {
  return file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
}

/**
 * Utility function to validate if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Utility function to validate if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * Deletes a file from the filesystem
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = join(process.cwd(), filePath.replace(/^\//, ""));
    await unlink(fullPath);
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    // Don't throw error for file deletion failures in production
    // as the file might already be deleted or not exist
  }
}

/**
 * Deletes multiple files from the filesystem
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<void> {
  await Promise.all(filePaths.map(deleteFile));
}

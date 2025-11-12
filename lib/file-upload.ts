import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { nanoidLower } from "@/lib/utils";
import sharp from "sharp";

export interface UploadOptions {
  directory: string;
  subdirectory?: string;
  generateUniqueFilename?: boolean;
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
  imageCompression?: false | CompressImageOptions; // true = default compression, object = custom settings, false/undefined = no compression
}

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}

export interface CompressImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-100
}

/**
 * Compresses an image using Sharp
 * Converts most images to JPEG except GIF, PNG with transparency, and SVG
 */
async function compressImage(
  buffer: Buffer,
  originalFilename: string,
  options?: CompressImageOptions
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const extension = originalFilename.split(".").pop()?.toLowerCase();
  const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, "");

  // Special cases that should not be converted to JPEG
  const shouldPreserveFormat = ["gif", "svg", "webp"].includes(extension || "");

  // Check if PNG has transparency (preserve PNG format if it does)
  let preservePng = false;
  if (extension === "png") {
    try {
      const metadata = await sharp(buffer).metadata();
      preservePng = metadata.hasAlpha === true;
    } catch (error) {
      console.warn("Could not check PNG transparency:", error);
    }
  }

  const defaultOptions: CompressImageOptions = {
    width: options?.width || 1920,
    height: options?.height || 1080,
    quality: options?.quality || 80,
  };

  let sharpInstance = sharp(buffer).resize(defaultOptions.width, defaultOptions.height, {
    fit: "inside",
    withoutEnlargement: true,
  });

  let outputFilename: string;
  let mimeType: string;

  if (shouldPreserveFormat || preservePng) {
    // Keep original format for special cases
    outputFilename = originalFilename;
    mimeType = `image/${extension}`;

    // For PNG with transparency or special formats, apply basic optimization
    if (extension === "png") {
      sharpInstance = sharpInstance.png({ quality: defaultOptions.quality });
    } else if (extension === "webp") {
      sharpInstance = sharpInstance.webp({ quality: defaultOptions.quality });
    }
  } else {
    // Convert to JPEG for better compression
    outputFilename = `${nameWithoutExtension}.jpg`;
    mimeType = "image/jpeg";
    sharpInstance = sharpInstance.jpeg({ quality: defaultOptions.quality });
  }

  const compressedBuffer = await sharpInstance.toBuffer();

  return {
    buffer: Buffer.from(compressedBuffer),
    filename: outputFilename,
    mimeType,
  };
}

/**
 * Validates file extension against allowed extensions
 */
function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Generates a unique filename with timestamp
 */
function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split(".").pop();
  const name = nanoidLower(10);

  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  return [name, "_", timestamp, ".", extension].filter(Boolean).join("");
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
export async function uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
  // Validate file size
  if (options.maxFileSize && file.size > options.maxFileSize) {
    throw new Error(`File size exceeds maximum limit of ${options.maxFileSize} bytes`);
  }

  // Validate file extension
  if (options.allowedExtensions && !validateFileExtension(file.name, options.allowedExtensions)) {
    throw new Error(`File type not allowed. Allowed extensions: ${options.allowedExtensions.join(", ")}`);
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(bytes);
  let finalFilename = file.name;
  let finalMimeType = file.type;

  // Compress image if compression options are provided and it's an image file
  if (options?.imageCompression !== false && isImageFile(file)) {
    try {
      const compressed = await compressImage(buffer, file.name, options?.imageCompression);
      buffer = Buffer.from(compressed.buffer);
      finalFilename = compressed.filename;
      finalMimeType = compressed.mimeType;
    } catch (error) {
      console.warn(`Failed to compress image ${file.name}:`, error);
      // Continue with original file if compression fails
    }
  }

  // Generate filename (use compressed filename if available)
  const filename = options.generateUniqueFilename ? generateUniqueFilename(finalFilename) : finalFilename;

  // Build directory path
  const uploadDir = join(process.cwd(), options.directory, ...(options.subdirectory ? [options.subdirectory] : []));

  console.log("-------------------- uploadDir --------------------");
  console.log(uploadDir);

  // Ensure directory exists
  await ensureDirectoryExists(uploadDir);

  // Write file
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  // Generate public URL
  const publicUrl = `/${options.directory}${options.subdirectory ? `/${options.subdirectory}` : ""}/${filename}`;

  return {
    url: publicUrl,
    filename,
    originalName: file.name,
    size: buffer.length,
    type: finalMimeType,
  };
}

/**
 * Uploads multiple files to the specified directory
 */
export async function uploadMultipleFiles(files: File[], options: UploadOptions): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw new Error(
        `Failed to upload file ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return results;
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

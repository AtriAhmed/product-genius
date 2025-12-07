import { nanoidLower } from "@/lib/utils";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { mkdir, rmdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

export interface UploadOptions {
  directory: string;
  generateUniqueFilename?: boolean;
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
  imageCompression?: false | CompressImageOptions; // true = default compression, object = custom settings, false/undefined = no compression
  videoCompression?: false | CompressVideoOptions; // false = no compression, object = custom settings, undefined = default compression
}

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  preview?: {
    url: string;
    filename: string;
    size: number;
  };
}

export interface S3UploadResult {
  key: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  preview?: {
    key: string;
    filename: string;
    size: number;
  };
}

export interface CompressImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-100
}

export interface CompressVideoOptions {
  crf?: number; // 0-51, lower = better quality
  generatePreview?: boolean;
  previewDuration?: number; // seconds for preview
  previewQuality?: number; // CRF for preview (higher = lower quality)
  previewScale?: number; // 0-1, e.g., 0.5 = 50% of original resolution
}

export interface VideoCompressionResult {
  compressedBuffer: Buffer;
  previewBuffer?: Buffer;
  compressedFilename: string;
  previewFilename?: string;
  mimeType: string;
}

/**
 * Checks if FFmpeg is available on the system
 */
export async function checkFFmpegAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn("ffmpeg", ["-version"]);

    ffmpeg.on("close", (code) => {
      resolve(code === 0);
    });

    ffmpeg.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Gets video information using FFprobe
 */
export async function getVideoInfo(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  codec: string;
}> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    let output = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFprobe process exited with code ${code}`));
        return;
      }

      try {
        const info = JSON.parse(output);
        const videoStream = info.streams.find((stream: any) => stream.codec_type === "video");

        if (!videoStream) {
          reject(new Error("No video stream found"));
          return;
        }

        resolve({
          duration: parseFloat(info.format.duration || "0"),
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          bitrate: parseInt(info.format.bit_rate || "0"),
          codec: videoStream.codec_name || "unknown",
        });
      } catch (error) {
        reject(new Error(`Failed to parse video info: ${error}`));
      }
    });

    ffprobe.on("error", (error) => {
      reject(new Error(`Failed to spawn FFprobe: ${error.message}`));
    });
  });
}

/**
 * Compresses a video using FFmpeg with x264 codec
 * Generates both compressed video and optional preview
 */
export async function compressVideo(
  buffer: Buffer,
  originalFilename: string,
  options?: CompressVideoOptions
): Promise<VideoCompressionResult> {
  const extension = originalFilename.split(".").pop()?.toLowerCase();
  const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, "");

  const defaultOptions: Required<CompressVideoOptions> = {
    crf: options?.crf || 23,
    generatePreview: options?.generatePreview ?? true,
    previewDuration: options?.previewDuration || 20,
    previewQuality: options?.previewQuality || 30,
    previewScale: options?.previewScale || 0.5,
  };

  // Create temporary directory for processing
  const tempDir = join(process.cwd(), "temp", `video_${nanoidLower(8)}`);
  await ensureDirectoryExists(tempDir);

  const inputPath = join(tempDir, `input.${extension}`);
  const outputPath = join(tempDir, "output.mp4");
  const previewPath = join(tempDir, "preview.mp4");

  try {
    // Write input file
    await writeFile(inputPath, buffer);

    // Compress main video
    const compressedBuffer = await ffmpegCompress(inputPath, outputPath, {
      scale: 1,
      crf: defaultOptions.crf,
      duration: undefined,
    });

    let previewBuffer: Buffer | undefined;
    let previewFilename: string | undefined;

    // Generate preview if requested
    if (defaultOptions.generatePreview) {
      previewBuffer = await ffmpegCompress(inputPath, previewPath, {
        scale: defaultOptions.previewScale,
        crf: defaultOptions.previewQuality,
        duration: defaultOptions.previewDuration,
      });
      previewFilename = `${nameWithoutExtension}_preview.mp4`;
    }

    return {
      compressedBuffer,
      previewBuffer,
      compressedFilename: `${nameWithoutExtension}.mp4`,
      previewFilename,
      mimeType: "video/mp4",
    };
  } finally {
    // Clean up temp files
    try {
      await unlink(inputPath).catch(() => {});
      await unlink(outputPath).catch(() => {});
      await unlink(previewPath).catch(() => {});
      await rmdir(tempDir).catch(() => {});
    } catch (error) {
      console.warn("Failed to clean up temp files:", error);
    }
  }
}

/**
 * Single reusable FFmpeg compression function
 * Can be used for main video compression or preview generation
 */
export async function ffmpegCompress(
  inputPath: string,
  outputPath: string,
  options: {
    scale: number; // 0-1, e.g., 0.5 = 50% of original
    crf: number;
    duration?: number;
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const args = ["-i", inputPath];

    // Add duration if specified
    if (options.duration) {
      args.push("-t", options.duration.toString());
    }

    args.push("-c:v", "libx264", "-crf", options.crf.toString());

    // Add scale if not 1
    if (options.scale !== 1) {
      args.push("-vf", `scale=iw*${options.scale}:ih*${options.scale}:flags=lanczos`);
    }

    args.push("-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-preset", "medium", "-y", outputPath);

    const ffmpeg = spawn("ffmpeg", args);

    let errorOutput = "";

    ffmpeg.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process exited with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        const compressedBuffer = await require("fs/promises").readFile(outputPath);
        resolve(Buffer.from(compressedBuffer));
      } catch (error) {
        reject(new Error(`Failed to read compressed video: ${error}`));
      }
    });

    ffmpeg.on("error", (error) => {
      reject(new Error(`Failed to spawn FFmpeg: ${error.message}`));
    });
  });
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd());

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

function parseRange(
  range: string,
  fileSize: number
): { start: number; end: number } | null {
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Validate range
  if (
    isNaN(start) ||
    isNaN(end) ||
    start > end ||
    start < 0 ||
    end >= fileSize
  ) {
    return null;
  }

  return { start, end };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filePathQuery = url.searchParams.get("path");

    if (!filePathQuery) {
      return new NextResponse("Query parameter 'path' is required", {
        status: 400,
      });
    }

    // Prevent directory traversal attacks
    const safePath = path
      .normalize(filePathQuery)
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(UPLOAD_DIR, safePath);

    // Ensure the resolved path is still within UPLOAD_DIR
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return new NextResponse("Invalid file path", { status: 403 });
    }

    // Check if file exists and is a file (not directory)
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const contentType = getContentType(filePath);

    // Check for range header
    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      const range = parseRange(rangeHeader, fileSize);

      if (!range) {
        return new NextResponse("Invalid range", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const { start, end } = range;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      return new NextResponse(fileStream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Return entire file using stream for efficiency
    const fileStream = fs.createReadStream(filePath);

    return new NextResponse(fileStream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

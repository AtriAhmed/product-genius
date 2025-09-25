import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // // Check authentication for admin routes
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get the file path from URL parameters
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    console.log("-------------------- filePath --------------------");
    console.log(filePath);

    // Security check: prevent directory traversal attacks
    if (filePath.includes("..") || filePath.includes("\\..")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // If it's an external URL (starts with http/https), redirect to it
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return NextResponse.redirect(filePath);
    }

    // Handle local files - construct safe file path
    const uploadsDir = path.join(process.cwd());
    const fullFilePath = path.join(uploadsDir, filePath);

    // Additional security check: ensure the resolved path is within uploads directory
    const normalizedUploadsDir = path.resolve(uploadsDir);
    const normalizedFilePath = path.resolve(fullFilePath);

    if (!normalizedFilePath.startsWith(normalizedUploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
      // Check if file exists
      if (!fs.existsSync(normalizedFilePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      // Read the file
      const fileBuffer = fs.readFileSync(normalizedFilePath);

      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";

      switch (ext) {
        case ".jpg":
        case ".jpeg":
          contentType = "image/jpeg";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".gif":
          contentType = "image/gif";
          break;
        case ".webp":
          contentType = "image/webp";
          break;
        case ".svg":
          contentType = "image/svg+xml";
          break;
        case ".mp4":
          contentType = "video/mp4";
          break;
        case ".mov":
          contentType = "video/quicktime";
          break;
        case ".avi":
          contentType = "video/x-msvideo";
          break;
        case ".webm":
          contentType = "video/webm";
          break;
        default:
          // Try to guess from file content or use default
          contentType = "application/octet-stream";
      }

      // Return the file with appropriate headers
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
          "Content-Length": fileBuffer.length.toString(),
          "Content-Disposition": "inline", // Display inline rather than download
        },
      });
    } catch (fileError) {
      console.error("Error reading file:", fileError);
      return NextResponse.json(
        { error: "Error reading file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Media serving error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

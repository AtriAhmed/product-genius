import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication for admin routes
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaId = parseInt(params.id);
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    // Find the media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        product: true, // Include product to verify ownership/access
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // If it's an external URL (starts with http/https), redirect to it
    if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
      return NextResponse.redirect(media.url);
    }

    // Handle local files
    // Assuming local files are stored in the uploads directory
    const filePath = path.join(process.cwd(), "uploads", media.url);

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      // Read the file
      const fileBuffer = fs.readFileSync(filePath);

      // Determine content type based on file extension
      const ext = path.extname(media.url).toLowerCase();
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
        default:
          // Try to determine from media type
          if (media.type === "IMAGE") {
            contentType = "image/jpeg"; // fallback
          } else if (media.type === "VIDEO") {
            contentType = "video/mp4"; // fallback
          }
      }

      // Return the file with appropriate headers
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
          "Content-Length": fileBuffer.length.toString(),
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

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  uploadProductMedia,
  getMediaType,
  deleteMultipleFiles,
} from "@/lib/file-upload";
import { z } from "zod";

// Validation schemas for updates
const translationSchema = z.object({
  locale: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const mediaSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().min(0),
});

const updateProductSchema = z.object({
  suggestedPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean(),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
});

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
        category: {
          include: {
            translations: {
              orderBy: { locale: "asc" },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role (ADMIN or OWNER only)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const productDataString = formData.get("productData") as string;

    if (!productDataString) {
      return NextResponse.json(
        { error: "Product data is required" },
        { status: 400 }
      );
    }

    const productData = JSON.parse(productDataString);

    // Validate the product data
    const validatedData = updateProductSchema.parse(productData);

    // Handle file uploads for new media
    const uploadedFiles: {
      file: File;
      sortOrder: number;
      type: "IMAGE" | "VIDEO";
    }[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        const file = value as File;
        const sortOrder = parseInt(key.split("_")[1]) || 0;
        const type = getMediaType(file);

        uploadedFiles.push({ file, sortOrder, type });
      }
    }

    // Save uploaded files and create media records
    const newMediaRecords = await Promise.all(
      uploadedFiles.map(async ({ file, sortOrder, type }) => {
        const uploadResult = await uploadProductMedia(file, productId);
        return {
          url: uploadResult.url,
          type,
          sortOrder,
        };
      })
    );

    // Combine existing media (from URLs) and new uploaded media
    const allMediaRecords = [
      ...validatedData.media, // Existing media from form
      ...newMediaRecords, // Newly uploaded files
    ];

    // Sort media by sortOrder
    allMediaRecords.sort((a, b) => a.sortOrder - b.sortOrder);

    // Get current media files to identify which ones to delete
    const currentMedia = await prisma.media.findMany({
      where: { productId },
      select: { url: true },
    });

    // Identify files to delete (local files that are no longer in the new media list)
    const newMediaUrls = new Set(allMediaRecords.map((m) => m.url));
    const filesToDelete = currentMedia
      .filter((m) => m.url.startsWith("/uploads/") && !newMediaUrls.has(m.url))
      .map((m) => m.url);

    // Update product in database with transaction
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        suggestedPrice: validatedData.suggestedPrice || null,
        currency: validatedData.currency || null,
        categoryId: validatedData.categoryId || null,
        isActive: validatedData.isActive,
        translations: {
          deleteMany: {}, // Remove existing translations
          create: validatedData.translations.map((translation) => ({
            locale: translation.locale,
            title: translation.title,
            description: translation.description,
          })),
        },
        media: {
          deleteMany: {}, // Remove existing media
          create: allMediaRecords.map((item, index) => ({
            url: item.url,
            type: item.type,
            sortOrder: index,
            provider: item.url.startsWith("/uploads/") ? "local" : "external",
          })),
        },
      },
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
        category: {
          include: {
            translations: {
              orderBy: { locale: "asc" },
            },
          },
        },
      },
    });

    // Clean up deleted files (don't await to avoid slowing down the response)
    if (filesToDelete.length > 0) {
      deleteMultipleFiles(filesToDelete).catch((error) => {
        console.error("Error cleaning up old media files:", error);
      });
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Product update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role (ADMIN or OWNER only)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists and get media files for cleanup
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        media: {
          select: { url: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get local files to delete
    const localFiles = existingProduct.media
      .filter((m) => m.url.startsWith("/uploads/"))
      .map((m) => m.url);

    // Delete the product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: productId },
    });

    // Clean up associated files (don't await to avoid slowing down the response)
    if (localFiles.length > 0) {
      deleteMultipleFiles(localFiles).catch((error) => {
        console.error("Error cleaning up product files:", error);
      });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

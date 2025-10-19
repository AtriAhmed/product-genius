import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getMediaType } from "@/lib/file-upload";

// Validation schemas
const mediaSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().min(0).default(0),
  provider: z.string().optional(),
  poster: z.string().nullable().optional(),
});

const translationSchema = z.object({
  locale: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const createProductSchema = z.object({
  suggestedPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
});

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
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

    // Handle form data with file uploads
    const formData = await request.formData();

    // Extract JSON data from form
    const productDataString = formData.get("productData") as string;
    if (!productDataString) {
      return NextResponse.json(
        { error: "Product data is required" },
        { status: 400 }
      );
    }

    const productData = JSON.parse(productDataString);

    // Validate the product data
    const validatedData = createProductSchema.parse(productData);

    // Create the product first
    const product = await prisma.product.create({
      data: {
        suggestedPrice: validatedData.suggestedPrice,
        currency: validatedData.currency,
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
      },
    });

    // Create a map from the media array (sortOrder -> mediaObject)
    const mediaMap = new Map(
      validatedData.media.map((media, index) => [index, { ...media }])
    );

    // Process form data entries for file uploads
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        const file = value as File;
        const index = parseInt(key.split("_")[1]);

        if (!isNaN(index) && mediaMap.has(index)) {
          // Upload the media file
          const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
          const allowedVideoExtensions = ["mp4", "webm", "mov", "avi"];
          const allowedExtensions = [
            ...allowedImageExtensions,
            ...allowedVideoExtensions,
          ];

          const uploadResult = await uploadFile(file, {
            directory: "uploads/products",
            subdirectory: product.id.toString(),
            generateUniqueFilename: true,
            allowedExtensions,
          });

          // Update the URL in the media map
          const mediaObject = mediaMap.get(index)!;
          mediaObject.url = uploadResult.url;
          mediaObject.type = getMediaType(file);
        }
      } else if (key.startsWith("poster_") && value instanceof File) {
        const file = value as File;
        const index = parseInt(key.split("_")[1]);

        if (!isNaN(index) && mediaMap.has(index)) {
          // Upload the poster file
          const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

          const posterUploadResult = await uploadFile(file, {
            directory: "uploads/products",
            subdirectory: `${product.id}/posters`,
            generateUniqueFilename: true,
            allowedExtensions: allowedImageExtensions,
          });

          // Update the poster in the media map
          const mediaObject = mediaMap.get(index)!;
          mediaObject.poster = posterUploadResult.url;
        }
      }
    }

    // Convert map back to array for database creation
    const allMediaRecords = Array.from(mediaMap.values()).map((media) => ({
      productId: product.id,
      url: media.url,
      type: media.type,
      sortOrder: media.sortOrder,
      provider: media.url.startsWith("/uploads/")
        ? "local"
        : media.provider || "external",
      poster: media.poster || null,
    }));

    // Create all media records
    if (allMediaRecords.length > 0) {
      await prisma.media.createMany({
        data: allMediaRecords,
      });
    }

    // Create translations with auto-generated slugs
    await prisma.productTranslation.createMany({
      data: validatedData.translations.map((translation) => ({
        productId: product.id,
        locale: translation.locale,
        title: translation.title,
        description: translation.description,
      })),
    });

    // Fetch the complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        translations: true,
        media: {
          orderBy: { sortOrder: "asc" },
        },
        category: true,
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: completeProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          translations: {
            some: { title: { contains: search } },
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (!["", null, undefined].includes(isActive)) {
      where.isActive = isActive === "true";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          translations: true,
          media: {
            orderBy: { sortOrder: "asc" },
            take: 1, // Only get the first media item for list view
          },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

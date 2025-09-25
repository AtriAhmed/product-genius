import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadProductMedia, getMediaType } from "@/lib/file-upload";

// Validation schemas
const mediaSchema = z.object({
  url: z.url(),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().min(0).default(0),
  provider: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const translationSchema = z.object({
  locale: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const supplierSchema = z.object({
  supplierId: z.number().int().positive(),
  url: z.url(),
  marketplace: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

const createProductSchema = z.object({
  suggestedPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
  suppliers: z.array(supplierSchema).optional().default([]),
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

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
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
          metadata: validatedData.metadata as any,
        },
      });

      // Handle file uploads
      const uploadedFiles: {
        file: File;
        sortOrder: number;
        type: "IMAGE" | "VIDEO";
      }[] = [];

      for (const [key, value] of formData.entries()) {
        if (key.startsWith("media_")) {
          const file = value as File;
          const sortOrder = parseInt(key.split("_")[1]) || 0;
          const type = getMediaType(file);

          uploadedFiles.push({ file, sortOrder, type });
        }
      }

      // Save uploaded files and create media records
      const mediaRecords = await Promise.all(
        uploadedFiles.map(async ({ file, sortOrder, type }) => {
          const uploadResult = await uploadProductMedia(file, product.id);
          return {
            productId: product.id,
            url: uploadResult.url,
            type,
            sortOrder,
            provider: "local",
          };
        })
      );

      // Add media from URLs (if any)
      const urlMediaRecords = validatedData.media.map((media) => ({
        productId: product.id,
        url: media.url,
        type: media.type,
        sortOrder: media.sortOrder,
        provider: media.provider || "external",
        metadata: media.metadata as any,
      }));

      // Create all media records
      if (mediaRecords.length > 0 || urlMediaRecords.length > 0) {
        await prisma.media.createMany({
          data: [...mediaRecords, ...urlMediaRecords],
        });
      }

      // Create translations with auto-generated slugs
      await prisma.productTranslation.createMany({
        data: validatedData.translations.map((translation) => ({
          productId: product.id,
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
          slug: generateSlug(translation.title),
        })),
      });

      // Create supplier relationships
      if (validatedData.suppliers.length > 0) {
        await prisma.productSupplier.createMany({
          data: validatedData.suppliers.map((supplier) => ({
            productId: product.id,
            supplierId: supplier.supplierId,
            url: supplier.url,
            marketplace: supplier.marketplace,
            price: supplier.price,
            currency: supplier.currency,
            isPrimary: supplier.isPrimary,
            notes: supplier.notes,
          })),
        });
      }

      // Fetch the complete product with all relations
      const completeProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          translations: true,
          media: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
          suppliers: {
            include: {
              supplier: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Product created successfully",
          product: completeProduct,
        },
        { status: 201 }
      );
    } else {
      // Handle JSON data (no file uploads)
      const body = await request.json();
      const validatedData = createProductSchema.parse(body);

      const product = await prisma.product.create({
        data: {
          suggestedPrice: validatedData.suggestedPrice,
          currency: validatedData.currency,
          categoryId: validatedData.categoryId,
          isActive: validatedData.isActive,
          metadata: validatedData.metadata as any,
          translations: {
            create: validatedData.translations.map((translation) => ({
              locale: translation.locale,
              title: translation.title,
              description: translation.description,
              slug: generateSlug(translation.title),
            })),
          },
          media: {
            create: validatedData.media.map((media) => ({
              url: media.url,
              type: media.type,
              sortOrder: media.sortOrder,
              provider: media.provider || "external",
              metadata: media.metadata as any,
            })),
          },
          suppliers: {
            create: validatedData.suppliers.map((supplier) => ({
              supplierId: supplier.supplierId,
              url: supplier.url,
              marketplace: supplier.marketplace,
              price: supplier.price,
              currency: supplier.currency,
              isPrimary: supplier.isPrimary,
              notes: supplier.notes,
            })),
          },
        },
        include: {
          translations: true,
          media: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
          suppliers: {
            include: {
              supplier: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Product created successfully",
          product,
        },
        { status: 201 }
      );
    }
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

    // if (isActive !== null) {
    //   where.isActive = isActive === "true";
    // }

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

    console.log("-------------------- products --------------------");
    console.log(products);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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

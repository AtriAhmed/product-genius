import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getMediaType } from "@/lib/file-upload";
import {
  generateVariants,
  validateVariants,
  type OptionDefinition,
} from "@/lib/variant-generator";

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

const supplierSchema = z.object({
  url: z.string().optional(),
  marketplace: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  isInternal: z.boolean().default(false),
  notes: z.string().optional(),
});

const productOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1).max(50), // Max 50 values per option
});

const createProductSchema = z.object({
  suggestedPrice: z.number().positive().optional().nullable(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
  suppliers: z.array(supplierSchema).optional().default([]),
  productOptions: z.array(productOptionSchema).max(3).optional().default([]), // Max 3 options per product (Shopify limit)
});

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

    // Create suppliers
    if (validatedData.suppliers.length > 0) {
      await prisma.supplier.createMany({
        data: validatedData.suppliers.map((supplier) => ({
          productId: product.id,
          url: supplier.url,
          marketplace: supplier.marketplace,
          price: supplier.price,
          currency: supplier.currency,
          isInternal: supplier.isInternal,
          notes: supplier.notes,
        })),
      });
    }

    // Create product options and variants
    if (validatedData.productOptions.length > 0) {
      // Create product options
      await Promise.all(
        validatedData.productOptions.map((option, index) =>
          prisma.productOption.create({
            data: {
              productId: product.id,
              name: option.name,
              position: index + 1,
              values: option.values,
            },
          })
        )
      );

      // Generate and create variants
      const basePrice = validatedData.suggestedPrice?.toString() || "0";
      const productCode = `PROD${product.id}`;

      const optionDefinitions: OptionDefinition[] =
        validatedData.productOptions.map((opt) => ({
          name: opt.name,
          values: opt.values,
        }));

      // Validate variant combinations
      const generatedVariants = generateVariants(
        optionDefinitions,
        basePrice,
        productCode,
        true
      );
      const validation = validateVariants(generatedVariants, optionDefinitions);

      if (!validation.valid) {
        throw new Error(`Invalid variants: ${validation.errors.join(", ")}`);
      }

      // Create variants in database
      await prisma.productVariant.createMany({
        data: generatedVariants.map((variant) => ({
          productId: product.id,
          option1: variant.option1 || null,
          option2: variant.option2 || null,
          option3: variant.option3 || null,
          price: variant.price,
          sku: variant.sku || null,
          inventory: 0,
          trackInventory: false,
        })),
      });
    } else {
      // Create a single default variant for products without options
      const basePrice = validatedData.suggestedPrice?.toString() || "0";
      const productCode = `PROD${product.id}`;

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          price: basePrice,
          sku: `PG-${productCode}`,
          inventory: 0,
          trackInventory: false,
        },
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
        suppliers: true,
        productOptions: true,
        productVariants: true,
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
          category: {
            include: {
              translations: true,
            },
          },
          suppliers: true,
          productOptions: true,
          productVariants: {
            take: 5, // Limit variants in list view
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page,
      limit,
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

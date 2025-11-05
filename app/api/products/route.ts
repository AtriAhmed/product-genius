import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getMediaType } from "@/lib/file-upload";
import { generateVariants, validateVariants, type OptionDefinition } from "@/lib/variant-generator";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

// Validation schemas (unchanged media/translation/supplier/productOption)
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
  values: z.array(z.string().min(1)).min(1).max(50),
});

// Variant schema: allow numeric or numeric-string price, optional sku/inventory/trackInventory
const variantSchema = z.object({
  option1: z.string().nullable().optional(),
  option2: z.string().nullable().optional(),
  option3: z.string().nullable().optional(),
  price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d+)?$/)]),
  sku: z.string().optional().nullable(),
  inventory: z.number().int().min(0).optional().default(0),
  trackInventory: z.boolean().optional().default(false),
});

const createProductSchema = z.object({
  price: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  sellingPrice: z.number().positive().optional().nullable(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  planIds: z.array(z.number().int().positive()).optional().default([]),
  isActive: z.boolean().default(true),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
  suppliers: z.array(supplierSchema).optional().default([]),
  productOptions: z.array(productOptionSchema).max(3).optional().default([]),
  // New: variants are provided from client when you want to control prices/skus
  variants: z.array(variantSchema).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const user = isAuthenticatedServerSide(["ADMIN", "OWNER", "EDITOR"], false);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle form data with file uploads
    const formData = await request.formData();

    // Extract JSON data from form
    const productDataString = formData.get("productData") as string;
    if (!productDataString) {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 });
    }

    const productData = JSON.parse(productDataString);

    // Validate the product data (now includes variants)
    const validatedData = createProductSchema.parse(productData);

    // Create the product first
    const product = await prisma.product.create({
      data: {
        price: validatedData.price,
        compareAtPrice: validatedData.compareAtPrice,
        sellingPrice: validatedData.sellingPrice,
        currency: validatedData.currency,
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
        plans:
          validatedData.planIds.length > 0
            ? {
                connect: validatedData.planIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    // (file upload processing for media/posters unchanged)
    const mediaMap = new Map(validatedData.media.map((media, index) => [index, { ...media }]));

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        const file = value as File;
        const index = parseInt(key.split("_")[1]);

        if (!isNaN(index) && mediaMap.has(index)) {
          const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
          const allowedVideoExtensions = ["mp4", "webm", "mov", "avi"];
          const allowedExtensions = [...allowedImageExtensions, ...allowedVideoExtensions];

          const uploadResult = await uploadFile(file, {
            directory: "uploads/products",
            subdirectory: product.id.toString(),
            generateUniqueFilename: true,
            allowedExtensions,
          });

          const mediaObject = mediaMap.get(index)!;
          mediaObject.url = uploadResult.url;
          mediaObject.type = getMediaType(file);
        }
      } else if (key.startsWith("poster_") && value instanceof File) {
        const file = value as File;
        const index = parseInt(key.split("_")[1]);

        if (!isNaN(index) && mediaMap.has(index)) {
          const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

          const posterUploadResult = await uploadFile(file, {
            directory: "uploads/products",
            subdirectory: `${product.id}/posters`,
            generateUniqueFilename: true,
            allowedExtensions: allowedImageExtensions,
          });

          const mediaObject = mediaMap.get(index)!;
          mediaObject.poster = posterUploadResult.url;
        }
      }
    }

    const allMediaRecords = Array.from(mediaMap.values()).map((media) => ({
      productId: product.id,
      url: media.url,
      type: media.type,
      sortOrder: media.sortOrder,
      provider: media.url.startsWith("/uploads/") ? "local" : media.provider || "external",
      poster: media.poster || null,
    }));

    if (allMediaRecords.length > 0) {
      await prisma.media.createMany({
        data: allMediaRecords,
      });
    }

    // Create translations with auto-generated slugs (unchanged)
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

    // === Create product options and variants (updated to accept client-provided variants) ===
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

      // Build optionDefinitions for validation
      const optionDefinitions: OptionDefinition[] = validatedData.productOptions.map((opt) => ({
        name: opt.name,
        values: opt.values,
      }));

      // If client provided variants, use them; otherwise generate
      if (validatedData.variants.length > 0) {
        // Validate provided variants against options
        // normalize prices to string for validateVariants if needed by your validator
        const normalizedProvided = validatedData.variants.map((v) => ({
          ...v,
          price: typeof v.price === "number" ? v.price.toString() : v.price,
        }));

        const validation = validateVariants(normalizedProvided, optionDefinitions);

        if (!validation.valid) {
          throw new Error(`Invalid variants: ${validation.errors.join(", ")}`);
        }

        // Create provided variants in DB
        await prisma.productVariant.createMany({
          data: validatedData.variants.map((variant) => ({
            productId: product.id,
            option1: variant.option1 || null,
            option2: variant.option2 || null,
            option3: variant.option3 || null,
            price: typeof variant.price === "number" ? variant.price.toString() : variant.price,
            sku: variant.sku || null,
            inventory: variant.inventory ?? 0,
            trackInventory: variant.trackInventory ?? false,
          })),
        });
      } else {
        // Fall back to generating variants (old behavior)
        const basePrice = (validatedData.price || validatedData.sellingPrice)?.toString() || "0";
        const productCode = `PROD${product.id}`;

        const generatedVariants = generateVariants(optionDefinitions, basePrice, productCode, true);
        const validation = validateVariants(generatedVariants, optionDefinitions);

        if (!validation.valid) {
          throw new Error(`Invalid variants: ${validation.errors.join(", ")}`);
        }

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
      }
    } else {
      // No product options
      if (validatedData.variants.length > 0) {
        // Accept provided single-variant or multiple variants (option fields will be ignored / null)
        await prisma.productVariant.createMany({
          data: validatedData.variants.map((variant) => ({
            productId: product.id,
            option1: variant.option1 || null,
            option2: variant.option2 || null,
            option3: variant.option3 || null,
            price: typeof variant.price === "number" ? variant.price.toString() : variant.price,
            sku: variant.sku || null,
            inventory: variant.inventory ?? 0,
            trackInventory: variant.trackInventory ?? false,
          })),
        });
      } else {
        // Create a single default variant for products without options (unchanged)
        const basePrice = (validatedData.price || validatedData.sellingPrice)?.toString() || "0";
        const productCode = `PROD${product.id}`;

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            price: basePrice,
            sku: productCode,
            inventory: 0,
            trackInventory: false,
          },
        });
      }
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
        plans: {
          include: {
            prices: true,
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

const getProductsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  planId: z.coerce.number().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "price", "compareAtPrice", "sellingPrice"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  const user = await isAuthenticatedServerSide([], false);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = getProductsSchema.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      planId: searchParams.get("planId") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    });

    const skip = (query.page - 1) * query.limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        {
          translations: {
            some: { title: { contains: query.search } },
          },
        },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.planId) {
      where.plans = {
        some: {
          id: query.planId,
        },
      };
    }

    if (query.isActive) {
      where.isActive = query.isActive === "true";
    }

    // Build orderBy based on sortBy and sortOrder
    let orderBy: any = { createdAt: "desc" };

    if (query.sortBy === "updatedAt") {
      orderBy = { updatedAt: query.sortOrder };
    } else if (query.sortBy === "price") {
      orderBy = { price: query.sortOrder };
    } else if (query.sortBy === "compareAtPrice") {
      orderBy = { compareAtPrice: query.sortOrder };
    } else if (query.sortBy === "sellingPrice") {
      orderBy = { sellingPrice: query.sortOrder };
    } else if (query.sortBy === "createdAt") {
      orderBy = { createdAt: query.sortOrder };
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
          productMappings: {
            where: {
              userId: parseInt(user.id),
            },
          },
          plans: {
            include: {
              prices: true,
            },
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }

    console.error("Products fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

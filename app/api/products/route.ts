import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getMediaType } from "@/lib/file-upload";
// Removed variant-generator import as we now use proper table relationships
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { isAuthorized } from "@/lib/authUtils";

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

const productOptionValueSchema = z.object({
  id: z.string(), // temp ID
  value: z.string().min(1),
});

const productOptionSchema = z.object({
  id: z.string(), // temp ID
  name: z.string().min(1),
  values: z.array(productOptionValueSchema).min(1).max(50),
});

// Variant schema for the new table structure
const variantSchema = z.object({
  id: z.string(), // temp ID
  optionValueIds: z.array(z.string()).optional().default([]), // temp IDs of option values
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  sellingPrice: z.number().positive().optional().nullable(),
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
  options: z.array(productOptionSchema).max(3).optional().default([]),
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

    // === Create product options and variants using new table structure ===
    if (validatedData.options.length > 0) {
      // Create mapping from temp IDs to database IDs
      const optionIdMap = new Map<string, number>();
      const valueIdMap = new Map<string, number>();

      // Create product options with their values
      for (let index = 0; index < validatedData.options.length; index++) {
        const option = validatedData.options[index];

        const createdOption = await prisma.productOption.create({
          data: {
            productId: product.id,
            name: option.name,
            position: index + 1,
          },
        });

        optionIdMap.set(option.id, createdOption.id);

        // Create option values
        for (let valueIndex = 0; valueIndex < option.values.length; valueIndex++) {
          const value = option.values[valueIndex];

          const createdValue = await prisma.productOptionValue.create({
            data: {
              optionId: createdOption.id,
              value: value.value,
              position: valueIndex,
            },
          });

          valueIdMap.set(value.id, createdValue.id);
        }
      }

      // Create variants from client-provided data only
      for (const variant of validatedData.variants) {
        const createdVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || null,
            sellingPrice: variant.sellingPrice || null,
            sku: variant.sku || null,
            inventory: variant.inventory ?? 0,
            trackInventory: variant.trackInventory ?? false,
          },
        });

        // Link variant to option values using temp ID mappings
        for (const tempValueId of variant.optionValueIds) {
          const realValueId = valueIdMap.get(tempValueId);
          if (realValueId) {
            // Find the option ID for this value
            const optionValue = await prisma.productOptionValue.findUnique({
              where: { id: realValueId },
              select: { optionId: true },
            });

            if (optionValue) {
              await prisma.productVariantOptionValue.create({
                data: {
                  productVariantId: createdVariant.id,
                  optionId: optionValue.optionId,
                  valueId: realValueId,
                },
              });
            }
          }
        }
      }
    } else {
      // No product options - create variant(s) without options
      const basePrice = validatedData.price || validatedData.sellingPrice || 0;

      if (validatedData.variants.length > 0) {
        // Use provided variant(s) even without options
        for (const variant of validatedData.variants) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice || null,
              sellingPrice: variant.sellingPrice || null,
              sku: variant.sku || `PROD${product.id}`,
              inventory: variant.inventory ?? 0,
              trackInventory: variant.trackInventory ?? false,
            },
          });
        }
      } else {
        // Create single default variant
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            price: basePrice,
            sku: `PROD${product.id}`,
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
        options: {
          include: {
            values: {
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
        variants: {
          include: {
            options: {
              include: {
                option: true,
                value: true,
              },
            },
          },
        },
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
  const user = await isAuthenticatedServerSide([], true);
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

    if (!isAuthorized(user, ["ADMIN", "OWNER", "EDITOR"])) {
      if (user?.currentSubscription?.planId) {
        where.plans = { some: { id: user.currentSubscription.planId } };
      } else {
        const freePlan = await prisma.plan.findFirst({
          where: { isFree: true },
        });
        if (freePlan) {
          where.plans = { some: { id: freePlan.id } };
        }
      }
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
          options: {
            include: {
              values: {
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
          variants: {
            take: 5, // Limit variants in list view
            include: {
              options: {
                include: {
                  option: true,
                  value: true,
                },
              },
            },
          },
          productMappings: {
            where: {
              userId: user.id,
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

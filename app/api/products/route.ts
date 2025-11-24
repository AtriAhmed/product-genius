import { deleteMultipleFiles, getMediaType, uploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// Removed variant-generator import as we now use proper table relationships
import { isAuthorized } from "@/lib/authUtils";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { getUserSubscriptionInfo } from "@/lib/subscriptionInfoUtils";

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
  position: z.number().int().min(0).optional().default(0),
});

const productOptionSchema = z.object({
  id: z.string(), // temp ID
  name: z.string().min(1),
  position: z.number().int().min(0).optional().default(0),
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

const shippingRuleSchema = z.object({
  price: z.number().int().min(0),
  minQuantity: z.number().int().min(0).optional().nullable(),
  maxQuantity: z.number().int().min(0).optional().nullable(),
});

const productShippingZoneSchema = z.object({
  zoneId: z.number().int().positive(),
  rules: z.array(shippingRuleSchema).min(1),
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
  shippingZones: z.array(productShippingZoneSchema).optional().default([]),
});

// Cleanup function to remove uploaded files when product creation fails
// Note: Database cleanup is handled automatically by Prisma transaction rollback
async function performFileCleanup(uploadedFiles: string[] = []) {
  if (uploadedFiles.length === 0) {
    return; // Nothing to cleanup
  }

  console.log("Performing file cleanup for failed product creation...");

  try {
    // Use the helper function to delete all uploaded files at once
    await deleteMultipleFiles(uploadedFiles);
    console.log(`Deleted ${uploadedFiles.length} uploaded files`);
  } catch (cleanupError) {
    console.error("Error during file cleanup:", cleanupError);
    // Don't throw here to avoid masking the original error
  }
}

export async function POST(request: NextRequest) {
  let product: any = null;
  let uploadedFiles: string[] = [];

  try {
    // Strategy:
    // 1. Validate input first (fail fast)
    // 2. Use Prisma transaction for ALL operations (DB + file uploads)
    // 3. Upload files using real product ID (no temp directories needed)
    // 4. If anything fails, transaction rollback handles DB, we only cleanup files
    const user = await isAuthenticatedServerSide(["ADMIN", "OWNER", "EDITOR"], false);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle form data with file uploads
    const formData = await request.formData();

    // Extract JSON data from form
    const rawProductData = formData.get("productData");
    if (typeof rawProductData !== "string") {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 });
    }

    let productData;
    try {
      productData = JSON.parse(rawProductData);
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in product data" }, { status: 400 });
    }

    // Validate the product data (now includes variants)
    const validatedData = createProductSchema.parse(productData);

    // Prepare media map for processing (but don't upload files yet)
    const mediaMap = new Map(validatedData.media.map((media, index) => [index, { ...media }]));

    // Use transaction for ALL operations (database + file uploads)
    product = await prisma.$transaction(async (tx) => {
      // Create the product first
      const createdProduct = await tx.product.create({
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

      // Now handle file uploads using the real product ID
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("media_") && value instanceof File) {
          const file = value as File;
          const index = parseInt(key.split("_")[1]);

          if (!isNaN(index) && mediaMap.has(index)) {
            const allowedImageExtensions = [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "webp",
              "svg",
              "bmp",
              "tiff",
              "tif",
              "ico",
              "avif",
            ];
            const allowedVideoExtensions = ["mp4", "webm", "ogg"];

            const allowedExtensions = [...allowedImageExtensions, ...allowedVideoExtensions];

            const uploadResult = await uploadFile(file, {
              directory: "uploads/products",
              subdirectory: createdProduct.id.toString(),
              generateUniqueFilename: true,
              allowedExtensions,
            });

            // Track uploaded files for cleanup
            uploadedFiles.push(uploadResult.url);

            const mediaObject = mediaMap.get(index)!;
            mediaObject.url = uploadResult.url;
            mediaObject.type = getMediaType(file);
          }
        } else if (key.startsWith("poster_") && value instanceof File) {
          const file = value as File;
          const index = parseInt(key.split("_")[1]);

          if (!isNaN(index) && mediaMap.has(index)) {
            const allowedImageExtensions = [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "webp",
              "svg",
              "bmp",
              "tiff",
              "tif",
              "ico",
              "avif",
            ];

            const posterUploadResult = await uploadFile(file, {
              directory: "uploads/products",
              subdirectory: `${createdProduct.id}/posters`,
              generateUniqueFilename: true,
              allowedExtensions: allowedImageExtensions,
            });

            // Track uploaded files for cleanup
            uploadedFiles.push(posterUploadResult.url);

            const mediaObject = mediaMap.get(index)!;
            mediaObject.poster = posterUploadResult.url;
          }
        }
      }

      // Create media records
      const allMediaRecords = Array.from(mediaMap.values()).map((media) => ({
        productId: createdProduct.id,
        url: media.url,
        type: media.type,
        sortOrder: media.sortOrder,
        provider: media.url.startsWith("/uploads/") ? "local" : media.provider || "external",
        poster: media.poster || null,
      }));

      if (allMediaRecords.length > 0) {
        await tx.media.createMany({
          data: allMediaRecords,
        });
      }

      // Create translations
      await tx.productTranslation.createMany({
        data: validatedData.translations.map((translation) => ({
          productId: createdProduct.id,
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
        })),
      });

      // Create suppliers
      if (validatedData.suppliers.length > 0) {
        await tx.supplier.createMany({
          data: validatedData.suppliers.map((supplier) => ({
            productId: createdProduct.id,
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

          const createdOption = await tx.productOption.create({
            data: {
              productId: createdProduct.id,
              name: option.name,
              position: option.position !== undefined ? option.position : index + 1,
            },
          });

          optionIdMap.set(option.id, createdOption.id);

          // Create option values
          for (let valueIndex = 0; valueIndex < option.values.length; valueIndex++) {
            const value = option.values[valueIndex];

            const createdValue = await tx.productOptionValue.create({
              data: {
                optionId: createdOption.id,
                value: value.value,
                position: value.position !== undefined ? value.position : valueIndex,
              },
            });

            valueIdMap.set(value.id, createdValue.id);
          }
        }

        // Create variants from client-provided data only
        for (const variant of validatedData.variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: createdProduct.id,
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
              const optionValue = await tx.productOptionValue.findUnique({
                where: { id: realValueId },
                select: { optionId: true },
              });

              if (optionValue) {
                await tx.productVariantOptionValue.create({
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
            await tx.productVariant.create({
              data: {
                productId: createdProduct.id,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice || null,
                sellingPrice: variant.sellingPrice || null,
                sku: variant.sku || `PROD${createdProduct.id}`,
                inventory: variant.inventory ?? 0,
                trackInventory: variant.trackInventory ?? false,
              },
            });
          }
        } else {
          // Create single default variant
          await tx.productVariant.create({
            data: {
              productId: createdProduct.id,
              price: basePrice,
              sku: `PROD${createdProduct.id}`,
              inventory: 0,
              trackInventory: false,
            },
          });
        }
      }

      // Link shipping zones to product
      if (validatedData.shippingZones.length > 0) {
        for (const zone of validatedData.shippingZones) {
          await tx.productShippingZone.create({
            data: {
              productId: createdProduct.id,
              zoneId: zone.zoneId,
              productShippingRules: {
                create: zone.rules.map((rule) => ({
                  price: rule.price,
                  minQuantity: rule.minQuantity,
                  maxQuantity: rule.maxQuantity,
                })),
              },
            },
          });
        }
      }

      return createdProduct;
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
        productShippingZones: {
          include: {
            zone: {
              include: {
                countries: true,
              },
            },
            productShippingRules: true,
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

    // Cleanup uploaded files on failure
    // Note: Database records are automatically rolled back by Prisma transaction
    await performFileCleanup(uploadedFiles);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle specific Prisma errors
    if (error instanceof Error) {
      // Check for common database constraint errors
      if (error.message.includes("Unique constraint") || error.message.includes("unique constraint")) {
        return NextResponse.json(
          {
            error: "A product with similar data already exists",
          },
          { status: 409 }
        );
      }

      if (error.message.includes("Foreign key constraint") || error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          {
            error: "Referenced data (category, plan, etc.) does not exist",
          },
          { status: 400 }
        );
      }

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
      const userSubscriptionInfo = await getUserSubscriptionInfo(user?.id);

      if (!userSubscriptionInfo?.canViewProducts) {
        where.productMappings = {
          some: {
            userId: user.id,
          },
        };
      }
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
      if (query.sortOrder === "asc") {
        orderBy = { minPrice: "asc" };
      } else {
        orderBy = { maxPrice: "desc" };
      }
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
          productShippingZones: {
            include: {
              zone: {
                include: {
                  countries: true,
                },
              },
              productShippingRules: true,
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

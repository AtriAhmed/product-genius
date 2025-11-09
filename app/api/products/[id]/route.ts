import { authOptions } from "@/lib/auth";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { deleteMultipleFiles, getMediaType, uploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
// Removed variant-generator import as we now use proper table relationships
import { MARKETPLACES } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext<T> = {
  params: Promise<{ id: string }>;
};

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
  poster: z.string().nullable().optional(),
});
export const supplierSchema = z.object({
  tempId: z.string().optional(),
  url: z.url("Invalid URL").optional().nullable(),
  marketplace: z.enum(MARKETPLACES).optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  isInternal: z.boolean(),
  notes: z.string().optional().nullable(),
});

const productOptionValueSchema = z.object({
  id: z.union([z.string(), z.number()]), // temp ID (string) or real ID (number)
  value: z.string().min(1),
});

const productOptionSchema = z.object({
  id: z.union([z.string(), z.number()]), // temp ID (string) or real ID (number)
  name: z.string().min(1),
  values: z.array(productOptionValueSchema).min(1).max(50),
});

// Variant schema for the new table structure
const variantSchema = z.object({
  id: z.union([z.string(), z.number()]), // temp ID (string) or real ID (number)
  optionValueIds: z
    .array(z.union([z.string(), z.number()]))
    .optional()
    .default([]), // temp IDs or real IDs
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  sellingPrice: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  inventory: z.number().int().min(0).optional().default(0),
  trackInventory: z.boolean().optional().default(false),
});

const updateProductSchema = z.object({
  price: z.number().gte(0).optional().nullable(),
  compareAtPrice: z.number().gte(0).optional().nullable(),
  sellingPrice: z.number().gte(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  planIds: z.array(z.number().int().positive()).optional().default([]),
  isActive: z.boolean(),
  translations: z.array(translationSchema).min(1),
  media: z.array(mediaSchema).optional().default([]),
  suppliers: z.array(supplierSchema).optional().default([]),
  options: z.array(productOptionSchema).max(3).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
});

const patchProductSchema = z.object({
  price: z.number().gte(0).optional().nullable(),
  compareAtPrice: z.number().gte(0).optional().nullable(),
  sellingPrice: z.number().gte(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  planIds: z.array(z.number().int().positive()).optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).optional(),
  media: z.array(mediaSchema).optional(),
  suppliers: z.array(supplierSchema).optional(),
  options: z.array(productOptionSchema).max(3).optional(),
  variants: z.array(variantSchema).optional(),
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
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
        productMappings: {
          where: {
            userId: parseInt(session.user.id),
          },
          include: {
            shopifyStore: true,
          },
        },
        plans: {
          include: {
            prices: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const params = await ctx.params;

  try {
    const user = isAuthenticatedServerSide(["ADMIN", "OWNER", "EDITOR"], false);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
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
      return NextResponse.json({ error: "Product data is required" }, { status: 400 });
    }

    const productData = JSON.parse(productDataString);

    // Validate the product data
    const validatedData = updateProductSchema.parse(productData);

    // Create a map from the media array (sortOrder -> mediaObject)
    const mediaMap = new Map(validatedData.media.map((media, index) => [index, { ...media }]));

    // Process form data entries for file uploads
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        const file = value as File;
        const index = parseInt(key.split("_")[1]);

        if (!isNaN(index) && mediaMap.has(index)) {
          // Upload the media file
          const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
          const allowedVideoExtensions = ["mp4", "webm", "mov", "avi"];
          const allowedExtensions = [...allowedImageExtensions, ...allowedVideoExtensions];

          const uploadResult = await uploadFile(file, {
            directory: "uploads/products",
            subdirectory: productId.toString(),
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
            subdirectory: `${productId}/posters`,
            generateUniqueFilename: true,
            allowedExtensions: allowedImageExtensions,
          });

          // Update the poster in the media map
          const mediaObject = mediaMap.get(index)!;
          mediaObject.poster = posterUploadResult.url;
        }
      }
    }

    // Convert map back to array and sort by sortOrder
    const allMediaRecords = Array.from(mediaMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

    // Get current media files to identify which ones to delete
    const currentMedia = await prisma.media.findMany({
      where: { productId },
      select: { url: true, poster: true },
    });

    // Identify files to delete (local files that are no longer in the new media list)
    const newMediaUrls = new Set(allMediaRecords.map((m) => m.url));
    const newPosterUrls = new Set(allMediaRecords.map((m) => m.poster).filter(Boolean));

    const filesToDelete = [
      // Delete media files that are no longer in the list
      ...currentMedia.filter((m) => m.url.startsWith("/uploads/") && !newMediaUrls.has(m.url)).map((m) => m.url),
      // Delete poster files that are no longer in the list
      ...currentMedia
        .filter((m) => m.poster && m.poster.startsWith("/uploads/") && !newPosterUrls.has(m.poster))
        .map((m) => m.poster!),
    ];

    // === Update product options and variants using new table structure ===
    // Remove existing options and variants (cascade will handle related data)
    await prisma.productOption.deleteMany({
      where: { productId },
    });
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    if (validatedData.options.length > 0) {
      // Create mapping from temp/real IDs to database IDs
      const optionIdMap = new Map<string | number, number>();
      const valueIdMap = new Map<string | number, number>();

      // Create product options with their values
      for (let index = 0; index < validatedData.options.length; index++) {
        const option = validatedData.options[index];

        const createdOption = await prisma.productOption.create({
          data: {
            productId: productId,
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
            productId: productId,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || null,
            sellingPrice: variant.sellingPrice || null,
            sku: variant.sku || null,
            inventory: variant.inventory ?? 0,
            trackInventory: variant.trackInventory ?? false,
          },
        });

        console.log("-------------------- variant --------------------");
        console.log(variant);

        // Link variant to option values using temp/real ID mappings
        for (const valueId of variant.optionValueIds) {
          const realValueId = valueIdMap.get(valueId);
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
        // Use provided variant(s)
        for (const variant of validatedData.variants) {
          await prisma.productVariant.create({
            data: {
              productId: productId,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice || null,
              sellingPrice: variant.sellingPrice || null,
              sku: variant.sku || `PROD${productId}`,
              inventory: variant.inventory ?? 0,
              trackInventory: variant.trackInventory ?? false,
            },
          });
        }
      } else {
        // Create single default variant
        await prisma.productVariant.create({
          data: {
            productId: productId,
            price: basePrice,
            sku: `PROD${productId}`,
            inventory: 0,
            trackInventory: false,
          },
        });
      }
    }

    // Update product in database with transaction
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        price: validatedData.price || null,
        compareAtPrice: validatedData.compareAtPrice || null,
        sellingPrice: validatedData.sellingPrice || null,
        currency: validatedData.currency || null,
        categoryId: validatedData.categoryId || null,
        isActive: validatedData.isActive,
        plans: {
          set: [], // First disconnect all existing plans
          connect: validatedData.planIds.map((id) => ({ id })), // Then connect the new ones
        },
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
            poster: item.poster || null,
          })),
        },
        suppliers: {
          deleteMany: {}, // Remove existing suppliers
          create: validatedData.suppliers.map((supplier) => ({
            url: supplier.url,
            marketplace: supplier.marketplace,
            price: supplier.price,
            currency: supplier.currency,
            isInternal: supplier.isInternal,
            notes: supplier.notes,
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

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const params = await ctx.params;

  try {
    const user = isAuthenticatedServerSide(["ADMIN", "OWNER", "EDITOR"], false);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: true,
        media: true,
        suppliers: true,
        options: {
          include: {
            values: true,
          },
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
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const productDataString = formData.get("productData") as string;

    if (!productDataString) {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 });
    }

    const productData = JSON.parse(productDataString);

    // Validate the product data
    const validatedData = patchProductSchema.parse(productData);

    // Prepare update data object - only include fields that are provided
    const updateData: any = {};

    // Handle basic product fields
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.compareAtPrice !== undefined) updateData.compareAtPrice = validatedData.compareAtPrice;
    if (validatedData.sellingPrice !== undefined) updateData.sellingPrice = validatedData.sellingPrice;
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    // Handle plan relationships
    if (validatedData.planIds !== undefined) {
      updateData.plans = {
        set: [], // First disconnect all existing plans
        connect: validatedData.planIds.map((id) => ({ id })), // Then connect the new ones
      };
    }

    // Handle translations
    if (validatedData.translations !== undefined && validatedData.translations.length > 0) {
      updateData.translations = {
        deleteMany: {}, // Remove existing translations
        create: validatedData.translations.map((translation) => ({
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
        })),
      };
    }

    // Handle media (with file uploads)
    let allMediaRecords: any[] = [];
    let filesToDelete: string[] = [];

    if (validatedData.media !== undefined) {
      // Create a map from the media array (sortOrder -> mediaObject)
      const mediaMap = new Map(validatedData.media.map((media, index) => [index, { ...media }]));

      // Process form data entries for file uploads
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("media_") && value instanceof File) {
          const file = value as File;
          const index = parseInt(key.split("_")[1]);

          if (!isNaN(index) && mediaMap.has(index)) {
            // Upload the media file
            const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
            const allowedVideoExtensions = ["mp4", "webm", "mov", "avi"];
            const allowedExtensions = [...allowedImageExtensions, ...allowedVideoExtensions];

            const uploadResult = await uploadFile(file, {
              directory: "uploads/products",
              subdirectory: productId.toString(),
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
              subdirectory: `${productId}/posters`,
              generateUniqueFilename: true,
              allowedExtensions: allowedImageExtensions,
            });

            // Update the poster in the media map
            const mediaObject = mediaMap.get(index)!;
            mediaObject.poster = posterUploadResult.url;
          }
        }
      }

      // Convert map back to array and sort by sortOrder
      allMediaRecords = Array.from(mediaMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

      // Identify files to delete (local files that are no longer in the new media list)
      const newMediaUrls = new Set(allMediaRecords.map((m) => m.url));
      const newPosterUrls = new Set(allMediaRecords.map((m) => m.poster).filter(Boolean));

      filesToDelete = [
        // Delete media files that are no longer in the list
        ...existingProduct.media
          .filter((m) => m.url.startsWith("/uploads/") && !newMediaUrls.has(m.url))
          .map((m) => m.url),
        // Delete poster files that are no longer in the list
        ...existingProduct.media
          .filter((m) => m.poster && m.poster.startsWith("/uploads/") && !newPosterUrls.has(m.poster))
          .map((m) => m.poster!),
      ];

      updateData.media = {
        deleteMany: {}, // Remove existing media
        create: allMediaRecords.map((item, index) => ({
          url: item.url,
          type: item.type,
          sortOrder: index,
          provider: item.url.startsWith("/uploads/") ? "local" : "external",
          poster: item.poster || null,
        })),
      };
    }

    // Handle suppliers
    if (validatedData.suppliers !== undefined) {
      updateData.suppliers = {
        deleteMany: {}, // Remove existing suppliers
        create: validatedData.suppliers.map((supplier) => ({
          url: supplier.url,
          marketplace: supplier.marketplace,
          price: supplier.price,
          currency: supplier.currency,
          isInternal: supplier.isInternal,
          notes: supplier.notes,
        })),
      };
    }

    // Handle options and variants
    if (validatedData.options !== undefined || validatedData.variants !== undefined) {
      // Remove existing options and variants (cascade will handle related data)
      await prisma.productOption.deleteMany({
        where: { productId },
      });
      await prisma.productVariant.deleteMany({
        where: { productId },
      });

      const options = validatedData.options || [];
      const variants = validatedData.variants || [];

      if (options.length > 0) {
        // Create mapping from temp/real IDs to database IDs
        const optionIdMap = new Map<string | number, number>();
        const valueIdMap = new Map<string | number, number>();

        // Create product options with their values
        for (let index = 0; index < options.length; index++) {
          const option = options[index];

          const createdOption = await prisma.productOption.create({
            data: {
              productId: productId,
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
        for (const variant of variants) {
          const createdVariant = await prisma.productVariant.create({
            data: {
              productId: productId,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice || null,
              sellingPrice: variant.sellingPrice || null,
              sku: variant.sku || null,
              inventory: variant.inventory ?? 0,
              trackInventory: variant.trackInventory ?? false,
            },
          });

          // Link variant to option values using temp/real ID mappings
          for (const valueId of variant.optionValueIds) {
            const realValueId = valueIdMap.get(valueId);
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
        const basePrice = validatedData.price || validatedData.sellingPrice || existingProduct.price || 0;

        if (variants.length > 0) {
          // Use provided variant(s)
          for (const variant of variants) {
            await prisma.productVariant.create({
              data: {
                productId: productId,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice || null,
                sellingPrice: variant.sellingPrice || null,
                sku: variant.sku || `PROD${productId}`,
                inventory: variant.inventory ?? 0,
                trackInventory: variant.trackInventory ?? false,
              },
            });
          }
        } else {
          // Create single default variant only if no variants exist
          const existingVariantsCount = await prisma.productVariant.count({
            where: { productId },
          });

          if (existingVariantsCount === 0) {
            await prisma.productVariant.create({
              data: {
                productId: productId,
                price: basePrice,
                sku: `PROD${productId}`,
                inventory: 0,
                trackInventory: false,
              },
            });
          }
        }
      }
    }

    // Update product in database only if there's something to update
    let updatedProduct;
    if (Object.keys(updateData).length > 0) {
      updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData,
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
    } else {
      // No updates needed, just return existing product with full relations
      updatedProduct = await prisma.product.findUnique({
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
    }

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
    console.error("Product patch error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
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
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check if product exists and get media files for cleanup
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        media: {
          select: { url: true, poster: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get local files to delete (both media and poster files)
    const localFiles = [
      // Media files
      ...existingProduct.media.filter((m) => m.url.startsWith("/uploads/")).map((m) => m.url),
      // Poster files
      ...existingProduct.media.filter((m) => m.poster && m.poster.startsWith("/uploads/")).map((m) => m.poster!),
    ];

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
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

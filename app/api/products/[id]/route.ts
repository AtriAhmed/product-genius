import { authOptions } from "@/lib/auth";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { deleteMultipleFiles, getMediaType, uploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { syncProductToShopify } from "@/lib/syncShopifyProduct";
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
  position: z.number().int().min(0).optional().default(0),
});

const productOptionSchema = z.object({
  id: z.union([z.string(), z.number()]), // temp ID (string) or real ID (number)
  name: z.string().min(1),
  position: z.number().int().min(0).optional().default(0),
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

    console.log("-------------------- validatedData --------------------");
    console.log(JSON.stringify(validatedData, null, 2));

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

      await Promise.all(
        Array.from(formData.entries()).map(async ([key, value]) => {
          if (key.startsWith("media_") && value instanceof File) {
            const file = value as File;
            const index = parseInt(key.split("_")[1]);

            if (!isNaN(index) && mediaMap.has(index)) {
              // Upload the media file
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
                subdirectory: `${productId}/posters`,
                generateUniqueFilename: true,
                allowedExtensions: allowedImageExtensions,
              });

              // Update the poster in the media map
              const mediaObject = mediaMap.get(index)!;
              mediaObject.poster = posterUploadResult.url;
            }
          }
        })
      );

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

    // Handle options and variants with proper CRUD operations
    if (validatedData.options !== undefined || validatedData.variants !== undefined) {
      const options = validatedData.options || [];
      const variants = validatedData.variants || [];

      // Create ID mapping for options and option values
      const optionIdMap = new Map<string | number, number>();
      const optionValueIdMap = new Map<string | number, number>();

      if (options.length > 0) {
        // Get existing options for comparison
        const existingOptionsMap = new Map(existingProduct.options.map((option) => [option.id, option]));
        const existingOptionValuesMap = new Map(
          existingProduct.options.flatMap((option) => option.values.map((value) => [value.id, value]))
        );

        // Track which options should remain
        const optionsToKeep = new Set<number>();
        const optionValuesToKeep = new Set<number>();

        // Process each option
        for (let index = 0; index < options.length; index++) {
          const option = options[index];
          const isExisting = typeof option.id === "number" && existingOptionsMap.has(option.id);

          if (isExisting) {
            // Update existing option
            const existingOption = existingOptionsMap.get(option.id as number)!;
            optionsToKeep.add(option.id as number);

            await prisma.productOption.update({
              where: { id: option.id as number },
              data: {
                name: option.name,
                position: option.position !== undefined ? option.position : index + 1,
              },
            });

            optionIdMap.set(option.id, option.id as number);
          } else {
            // Create new option
            const createdOption = await prisma.productOption.create({
              data: {
                productId,
                name: option.name,
                position: option.position !== undefined ? option.position : index + 1,
              },
            });

            optionIdMap.set(option.id, createdOption.id);
          }

          // Handle option values
          const currentOptionId = optionIdMap.get(option.id)!;
          const existingValuesForOption = isExisting
            ? existingProduct.options.find((o) => o.id === option.id)?.values || []
            : [];
          const existingValuesMap = new Map(existingValuesForOption.map((v) => [v.id, v]));

          for (let valueIndex = 0; valueIndex < option.values.length; valueIndex++) {
            const value = option.values[valueIndex];
            const isExistingValue = typeof value.id === "number" && existingValuesMap.has(value.id);

            if (isExistingValue) {
              // Update existing value
              optionValuesToKeep.add(value.id as number);

              await prisma.productOptionValue.update({
                where: { id: value.id as number },
                data: {
                  value: value.value,
                  position: value.position !== undefined ? value.position : valueIndex,
                },
              });

              optionValueIdMap.set(value.id, value.id as number);
            } else {
              // Create new value
              const createdValue = await prisma.productOptionValue.create({
                data: {
                  optionId: currentOptionId,
                  value: value.value,
                  position: value.position !== undefined ? value.position : valueIndex,
                },
              });

              optionValueIdMap.set(value.id, createdValue.id);
            }
          }

          const optionValuesToDelete =
            Array.from(existingOptionValuesMap?.keys())?.filter((id) => !optionValuesToKeep.has(id)) || [];

          // Delete option values that are no longer needed for this option
          if (isExisting) {
            await prisma.productOptionValue.deleteMany({
              where: {
                optionId: currentOptionId,
                id: {
                  in: optionValuesToDelete,
                },
              },
            });
          }
        }

        const optionsToDelete = Array.from(existingOptionsMap.keys()).filter((id) => !optionsToKeep.has(id));

        // Delete options that are no longer needed
        await prisma.productOption.deleteMany({
          where: {
            productId,
            id: {
              in: optionsToDelete,
            },
          },
        });

        // Handle variants
        if (variants.length > 0) {
          // Get existing variants for comparison
          const existingVariantsMap = new Map(existingProduct.variants.map((variant) => [variant.id, variant]));

          // Track which variants should remain
          const variantsToKeep = new Set<number>();

          for (const variant of variants) {
            const isExistingVariant = typeof variant.id === "number" && existingVariantsMap.has(variant.id);

            if (isExistingVariant) {
              // Update existing variant
              variantsToKeep.add(variant.id as number);

              await prisma.productVariant.update({
                where: { id: variant.id as number },
                data: {
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  sellingPrice: variant.sellingPrice,
                  sku: variant.sku,
                  inventory: variant.inventory || 0,
                  trackInventory: variant.trackInventory || false,
                },
              });

              // Update variant option values
              await prisma.productVariantOptionValue.deleteMany({
                where: { productVariantId: variant.id as number },
              });

              if (variant.optionValueIds && variant.optionValueIds.length > 0) {
                const variantOptionValues = variant.optionValueIds.map((valueId) => {
                  const realValueId = optionValueIdMap.get(valueId);
                  if (!realValueId) {
                    throw new Error(`Option value ID ${valueId} not found`);
                  }

                  // Find the option for this value
                  const option = options.find((o) => o.values.some((v) => optionValueIdMap.get(v.id) === realValueId));
                  if (!option) {
                    throw new Error(`Option for value ID ${realValueId} not found`);
                  }

                  const realOptionId = optionIdMap.get(option.id);
                  if (!realOptionId) {
                    throw new Error(`Option ID ${option.id} not found`);
                  }

                  return {
                    productVariantId: variant.id as number,
                    optionId: realOptionId,
                    valueId: realValueId,
                  };
                });

                await prisma.productVariantOptionValue.createMany({
                  data: variantOptionValues,
                });
              }
            } else {
              // Create new variant
              const createdVariant = await prisma.productVariant.create({
                data: {
                  productId,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  sellingPrice: variant.sellingPrice,
                  sku: variant.sku,
                  inventory: variant.inventory || 0,
                  trackInventory: variant.trackInventory || false,
                },
              });

              // Create variant option values
              if (variant.optionValueIds && variant.optionValueIds.length > 0) {
                const variantOptionValues = variant.optionValueIds.map((valueId) => {
                  const realValueId = optionValueIdMap.get(valueId);
                  if (!realValueId) {
                    throw new Error(`Option value ID ${valueId} not found`);
                  }

                  // Find the option for this value
                  const option = options.find((o) => o.values.some((v) => optionValueIdMap.get(v.id) === realValueId));
                  if (!option) {
                    throw new Error(`Option for value ID ${realValueId} not found`);
                  }

                  const realOptionId = optionIdMap.get(option.id);
                  if (!realOptionId) {
                    throw new Error(`Option ID ${option.id} not found`);
                  }

                  return {
                    productVariantId: createdVariant.id,
                    optionId: realOptionId,
                    valueId: realValueId,
                  };
                });

                console.log("-------------------- variantOptionValues --------------------");
                console.log(variantOptionValues);

                await prisma.productVariantOptionValue.createMany({
                  data: variantOptionValues,
                });
              }
            }
          }

          const variantsToDelete = Array.from(existingVariantsMap.keys()).filter((id) => !variantsToKeep.has(id));

          // Delete variants that are no longer needed
          await prisma.productVariant.deleteMany({
            where: {
              productId,
              id: {
                in: variantsToDelete,
              },
            },
          });
        } else {
          // No variants provided, delete all existing variants
          await prisma.productVariant.deleteMany({
            where: { productId },
          });
        }
      } else {
        // No options provided, handle variants without options
        const basePrice = validatedData.price || validatedData.sellingPrice || existingProduct.price || 0;

        if (variants.length > 0) {
          // Get existing variants for comparison
          const existingVariantsMap = new Map(existingProduct.variants.map((variant) => [variant.id, variant]));

          // Track which variants should remain
          const variantsToKeep = new Set<number>();

          for (const variant of variants) {
            const isExistingVariant = typeof variant.id === "number" && existingVariantsMap.has(variant.id);

            if (isExistingVariant) {
              // Update existing variant
              variantsToKeep.add(variant.id as number);

              await prisma.productVariant.update({
                where: { id: variant.id as number },
                data: {
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  sellingPrice: variant.sellingPrice,
                  sku: variant.sku || `PROD${productId}`,
                  inventory: variant.inventory || 0,
                  trackInventory: variant.trackInventory || false,
                },
              });
            } else {
              // Create new variant
              await prisma.productVariant.create({
                data: {
                  productId,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  sellingPrice: variant.sellingPrice,
                  sku: variant.sku || `PROD${productId}`,
                  inventory: variant.inventory || 0,
                  trackInventory: variant.trackInventory || false,
                },
              });
            }
          }

          const variantsToDelete = Array.from(existingVariantsMap.keys()).filter((id) => !variantsToKeep.has(id));

          // Delete variants that are no longer needed
          await prisma.productVariant.deleteMany({
            where: {
              productId,
              id: {
                in: variantsToDelete,
              },
            },
          });

          // Delete all options since no options are provided
          await prisma.productOption.deleteMany({
            where: { productId },
          });
        } else {
          // No variants provided, create single default variant if none exists
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

          // Delete all options since no options are provided
          await prisma.productOption.deleteMany({
            where: { productId },
          });
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

    // Sync product to Shopify if options or variants were updated
    const shouldSync = validatedData.options !== undefined || validatedData.variants !== undefined;
    if (shouldSync) {
      syncProductToShopify(productId).catch((error) => {
        console.error("Error syncing product to Shopify:", error);
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

    if (!user || !["ADMIN", "OWNER", "EDITOR"].includes(user.role)) {
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

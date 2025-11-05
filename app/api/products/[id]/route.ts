import { authOptions } from "@/lib/auth";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { deleteMultipleFiles, getMediaType, uploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { generateVariants, validateVariants, type OptionDefinition } from "@/lib/variant-generator";
import { MARKETPLACES } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
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

const productOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1).max(50), // Max 50 values per option
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
  productOptions: z.array(productOptionSchema).max(3).optional().default([]), // Max 3 options per product (Shopify limit)
  // New: variants are provided from client when you want to control prices/skus
  variants: z.array(variantSchema).optional().default([]),
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
        productOptions: true,
        productVariants: true,
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

    // === Update product options and variants (updated to accept client-provided variants) ===
    if (validatedData.productOptions.length > 0) {
      // Remove existing options and variants
      await prisma.productOption.deleteMany({
        where: { productId },
      });
      await prisma.productVariant.deleteMany({
        where: { productId },
      });

      // Create new product options
      await Promise.all(
        validatedData.productOptions.map((option, index) =>
          prisma.productOption.create({
            data: {
              productId: productId,
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
            productId: productId,
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
        const productCode = `PROD${productId}`;

        const generatedVariants = generateVariants(optionDefinitions, basePrice, productCode, true);
        const validation = validateVariants(generatedVariants, optionDefinitions);

        if (!validation.valid) {
          throw new Error(`Invalid variants: ${validation.errors.join(", ")}`);
        }

        await prisma.productVariant.createMany({
          data: generatedVariants.map((variant) => ({
            productId: productId,
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
      // Remove all options and variants
      await prisma.productOption.deleteMany({
        where: { productId },
      });
      await prisma.productVariant.deleteMany({
        where: { productId },
      });

      // No product options
      if (validatedData.variants.length > 0) {
        // Accept provided single-variant or multiple variants (option fields will be ignored / null)
        await prisma.productVariant.createMany({
          data: validatedData.variants.map((variant) => ({
            productId: productId,
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
        const productCode = `PROD${productId}`;

        await prisma.productVariant.create({
          data: {
            productId: productId,
            price: basePrice,
            sku: productCode,
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
        productOptions: true,
        productVariants: true,
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

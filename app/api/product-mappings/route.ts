import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAuthorized } from "@/lib/authUtils";

// Validation schemas
const createProductMappingSchema = z.object({
  productId: z.number().int().positive(),
  shopifyProductId: z.string().min(1),
  shopifyStoreId: z.number().int().positive(),
  shop: z.string().min(1),
});

const getProductMappingsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  productId: z.coerce.number().int().positive().optional(),
  shopifyStoreId: z.coerce.number().int().positive().optional(),
  shop: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "productId", "shopifyProductId", "shop"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = getProductMappingsSchema.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      productId: searchParams.get("productId") || undefined,
      shopifyStoreId: searchParams.get("shopifyStoreId") || undefined,
      shop: searchParams.get("shop") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    });

    const skip = (query.page - 1) * query.limit;

    const where: any = {};

    // If user is not ADMIN or OWNER, only show their product mappings
    if (!isAuthorized(user, ["ADMIN", "OWNER"])) {
      where.shopifyStore = {
        userId: parseInt(session.user.id),
      };
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.shopifyStoreId) {
      where.shopifyStoreId = query.shopifyStoreId;
    }

    if (query.shop) {
      where.shop = { contains: query.shop };
    }

    // Add search functionality
    if (query.search) {
      where.OR = [
        {
          product: {
            translations: {
              some: {
                title: { contains: query.search, mode: "insensitive" },
              },
            },
          },
        },
        {
          product: {
            sku: { contains: query.search, mode: "insensitive" },
          },
        },
        {
          shopifyProductId: { contains: query.search, mode: "insensitive" },
        },
        {
          shop: { contains: query.search, mode: "insensitive" },
        },
      ];
    }

    // Build orderBy based on sortBy and sortOrder
    let orderBy: any = { createdAt: "desc" };

    if (query.sortBy === "productId") {
      orderBy = { productId: query.sortOrder };
    } else if (query.sortBy === "shopifyProductId") {
      orderBy = { shopifyProductId: query.sortOrder };
    } else if (query.sortBy === "shop") {
      orderBy = { shop: query.sortOrder };
    } else if (query.sortBy === "createdAt") {
      orderBy = { createdAt: query.sortOrder };
    }

    const [productMappings, total] = await Promise.all([
      prisma.productMapping.findMany({
        where,
        include: {
          product: {
            include: {
              translations: true,
              media: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
          shopifyStore: true,
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.productMapping.count({ where }),
    ]);

    return NextResponse.json({
      data: productMappings,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Product mappings fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product mappings",
      },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const validatedData = createProductMappingSchema.parse(body);

    // Check if mapping already exists
    const existingMapping = await prisma.productMapping.findUnique({
      where: {
        productId_shop: {
          productId: validatedData.productId,
          shop: validatedData.shop,
        },
      },
    });

    if (existingMapping) {
      return NextResponse.json(
        { error: "Product mapping already exists for this product and shop" },
        { status: 400 }
      );
    }

    // Verify that product and shopify store exist
    const [product, shopifyStore] = await Promise.all([
      prisma.product.findUnique({
        where: { id: validatedData.productId },
      }),
      prisma.shopifyStore.findUnique({
        where: { id: validatedData.shopifyStoreId },
      }),
    ]);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!shopifyStore) {
      return NextResponse.json(
        { error: "Shopify store not found" },
        { status: 404 }
      );
    }

    const productMapping = await prisma.productMapping.create({
      data: {
        ...validatedData,
        userId: parseInt(session.user.id),
      },
      include: {
        product: {
          include: {
            translations: true,
            media: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
        shopifyStore: true,
      },
    });

    return NextResponse.json(productMapping, { status: 201 });
  } catch (error) {
    console.error("Product mapping creation error:", error);

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
      {
        error: "Failed to create product mapping",
      },
      { status: 500 }
    );
  }
}

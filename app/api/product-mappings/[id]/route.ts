import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAuthenticatedServerSide, isAuthorized } from "@/lib/authUtils";

// Validation schemas
const updateProductMappingSchema = z.object({
  productId: z.number().int().positive().optional(),
  shopifyProductId: z.string().min(1).optional(),
  shopifyStoreId: z.number().int().positive().optional(),
  shop: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product mapping ID" },
        { status: 400 }
      );
    }

    const where: any = { id };

    // If user is not ADMIN or OWNER, only allow access to their own mappings
    if (!["ADMIN", "OWNER"].includes(user.role)) {
      where.shopifyStore = {
        userId: parseInt(session.user.id),
      };
    }

    const productMapping = await prisma.productMapping.findFirst({
      where,
      include: {
        product: {
          include: {
            translations: true,
            media: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        shopifyStore: true,
      },
    });

    if (!productMapping) {
      return NextResponse.json(
        { error: "Product mapping not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(productMapping);
  } catch (error) {
    console.error("Product mapping fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product mapping",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product mapping ID" },
        { status: 400 }
      );
    }

    // Check if product mapping exists and user has access
    const whereCondition: any = { id };

    // If user is not ADMIN or OWNER, only allow access to their own mappings
    if (!["ADMIN", "OWNER"].includes(user.role)) {
      whereCondition.shopifyStore = {
        userId: parseInt(session.user.id),
      };
    }

    const existingMapping = await prisma.productMapping.findFirst({
      where: whereCondition,
    });

    if (!existingMapping) {
      return NextResponse.json(
        { error: "Product mapping not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateProductMappingSchema.parse(body);

    // If productId and shop are being updated, check for conflicts
    if (validatedData.productId && validatedData.shop) {
      const conflictingMapping = await prisma.productMapping.findUnique({
        where: {
          productId_shop: {
            productId: validatedData.productId,
            shop: validatedData.shop,
          },
        },
      });

      if (conflictingMapping && conflictingMapping.id !== id) {
        return NextResponse.json(
          { error: "Product mapping already exists for this product and shop" },
          { status: 400 }
        );
      }
    }

    // Verify that referenced resources exist if being updated
    if (validatedData.productId) {
      const product = await prisma.product.findUnique({
        where: { id: validatedData.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }

    if (validatedData.shopifyStoreId) {
      const shopifyStore = await prisma.shopifyStore.findUnique({
        where: { id: validatedData.shopifyStoreId },
      });

      if (!shopifyStore) {
        return NextResponse.json(
          { error: "Shopify store not found" },
          { status: 404 }
        );
      }
    }

    const productMapping = await prisma.productMapping.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json(productMapping);
  } catch (error) {
    console.error("Product mapping update error:", error);

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
        error: "Failed to update product mapping",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await isAuthenticatedServerSide([], false);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product mapping ID" },
        { status: 400 }
      );
    }

    // Check if product mapping exists and user has access
    const whereCondition: any = { id };

    // If user is not ADMIN or OWNER, only allow access to their own mappings
    if (!isAuthorized(user, ["ADMIN", "OWNER"])) {
      whereCondition.shopifyStore = {
        userId: parseInt(user.id),
      };
    }

    const existingMapping = await prisma.productMapping.findFirst({
      where: whereCondition,
    });

    if (!existingMapping) {
      return NextResponse.json(
        { error: "Product mapping not found" },
        { status: 404 }
      );
    }

    await prisma.productMapping.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product mapping deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product mapping deletion error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete product mapping",
      },
      { status: 500 }
    );
  }
}

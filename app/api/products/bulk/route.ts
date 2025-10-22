import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const validIds = productIds.filter(
      (id) => typeof id === "number" && !isNaN(id)
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid product IDs provided" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: validIds },
        isActive: true,
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
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Bulk products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

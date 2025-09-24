import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const filter = searchParams.get("filter") || "all";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    // Apply filters
    if (filter === "with_products") {
      where.products = { some: {} };
    } else if (filter === "without_products") {
      where.products = { none: {} };
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case "name":
        // For name sorting, we'll sort by the first translation's title
        orderBy = {
          translations: {
            _count: "desc",
          },
        };
        break;
      case "createdAt":
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        translations: {
          orderBy: {
            locale: "asc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { translations } = body;

    if (!translations || translations.length === 0) {
      return NextResponse.json(
        { error: "At least one translation is required" },
        { status: 400 }
      );
    }

    // Validate that all required fields are present
    for (const translation of translations) {
      if (!translation.locale || !translation.title) {
        return NextResponse.json(
          { error: "Each translation must have locale and title" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        translations: {
          create: translations.map((t: any) => ({
            locale: t.locale,
            title: t.title,
            description: t.description || "",
          })),
        },
      },
      include: {
        translations: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

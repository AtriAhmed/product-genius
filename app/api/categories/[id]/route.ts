import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Update category with transactions
    const category = await prisma.$transaction(async (prisma) => {
      // Delete existing translations
      await prisma.categoryTranslation.deleteMany({
        where: { categoryId },
      });

      // Update category and create new translations
      return await prisma.category.update({
        where: { id: categoryId },
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
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that has products assigned to it" },
        { status: 400 }
      );
    }

    // Delete category (translations will be deleted automatically via cascade)
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

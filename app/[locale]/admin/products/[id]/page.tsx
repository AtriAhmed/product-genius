import ProductForm from "@/app/[locale]/admin/products/ProductForm";
import { Product } from "@/types";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

async function getProduct(id: number): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
        plans: {
          include: {
            prices: true,
          },
        },
        suppliers: true,
        options: {
          include: {
            values: {
              orderBy: { position: "asc" },
            },
          },
        },
        variants: {
          omit: {
            createdAt: true,
            updatedAt: true,
          },
          include: {
            options: true,
          },
        },
        shippingZones: {
          include: {
            countries: true,
            rules: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Transform the product to match the Product type
    return product as any;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const productId = parseInt(id);
  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} mode="edit" />;
}

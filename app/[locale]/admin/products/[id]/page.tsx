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
      },
    });

    if (!product) {
      return null;
    }

    // Transform the product to match the Product type
    return product as Product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check user role (ADMIN or OWNER only)
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true },
  });

  if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
    redirect("/");
  }

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

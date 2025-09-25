"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  DollarSign,
  Calendar,
  Globe,
} from "lucide-react";
import Image from "next/image";

interface ProductTranslation {
  id: number;
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  translations: {
    id: number;
    locale: string;
    title: string;
    description: string;
  }[];
}

interface Media {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
}

interface Product {
  id: number;
  sku?: string;
  suggestedPrice?: number;
  currency?: string;
  isActive: boolean;
  translations: ProductTranslation[];
  media: Media[];
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get current locale translation
const getCurrentTranslation = (
  translations: ProductTranslation[],
  locale = "en"
) => {
  return (
    translations.find((t) => t.locale === locale) || translations[0] || null
  );
};

const getCurrentCategoryTranslation = (
  category: Category | undefined,
  locale = "en"
) => {
  if (!category) return null;
  return (
    category.translations.find((t) => t.locale === locale) ||
    category.translations[0] ||
    null
  );
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("products");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${productId}`);

        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch product");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to fetch product");
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleEdit = () => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleDelete = async () => {
    if (!product) return;

    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to delete product"
        );
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-10 h-10 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-md" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Product not found
            </h3>
            <p className="text-muted-foreground mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/admin/products")}>
              View All Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const translation = getCurrentTranslation(product.translations);
  const categoryTranslation = getCurrentCategoryTranslation(product.category);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {translation?.title || "Untitled Product"}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {product.sku && (
                  <Badge variant="outline">SKU: {product.sku}</Badge>
                )}
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    {t("title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {translation?.title || "No title available"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    {t("description")}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {translation?.description || "No description available"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            {product.media.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.media.map((media) => (
                      <div
                        key={media.id}
                        className="aspect-square relative overflow-hidden rounded-md border"
                      >
                        {media.type === "IMAGE" ? (
                          <Image
                            src={getMediaUrl(media.url)}
                            alt={translation?.title || "Product media"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <video
                            src={getMediaUrl(media.url)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Translations */}
            {product.translations.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t("translations")} ({product.translations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.translations.map((trans) => (
                      <div key={trans.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">
                            {trans.locale.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium">{trans.title}</h4>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {trans.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.suggestedPrice && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t("price")}</span>
                    </div>
                    <span className="font-medium">
                      {product.currency || "USD"}{" "}
                      {product.suggestedPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {categoryTranslation && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {t("category")}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {categoryTranslation.title}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Updated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

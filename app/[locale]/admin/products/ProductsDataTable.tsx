"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";

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

interface ProductsDataTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  isLoading?: boolean;
}

export default function ProductsDataTable({
  products,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}: ProductsDataTableProps) {
  const t = useTranslations("products");

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
      category.translations?.find((t) => t.locale === locale) ||
      category.translations?.[0] ||
      null
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border bg-background">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border bg-background">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("no products found")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("try adjusting your search or filters")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-0 min-w-full rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="font-medium w-16">Image</TableHead>
            <TableHead className="font-medium">{t("name")}</TableHead>
            <TableHead className="font-medium">SKU</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Price</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">{t("translations")}</TableHead>
            <TableHead className="font-medium text-center">
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const translation = getCurrentTranslation(product.translations);
            const categoryTranslation = getCurrentCategoryTranslation(
              product.category
            );
            const primaryMedia = product.media?.[0];

            return (
              <TableRow
                key={product.id}
                className="border-border hover:bg-muted/50 transition-colors"
              >
                {/* Product Image */}
                <TableCell>
                  <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    {primaryMedia?.url ? (
                      primaryMedia.type === "IMAGE" ? (
                        <Image
                          src={getMediaUrl(primaryMedia.url)}
                          alt={translation?.title || "Product"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={getMediaUrl(primaryMedia.url)}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Product Name */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {translation?.title || `Product #${product.id}`}
                    </span>
                    {translation?.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {translation.description}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* SKU */}
                <TableCell>
                  {product.sku ? (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No SKU
                    </span>
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  {categoryTranslation ? (
                    <Badge variant="outline" className="text-xs">
                      {categoryTranslation.title}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No category
                    </span>
                  )}
                </TableCell>

                {/* Price */}
                <TableCell>
                  {product.suggestedPrice ? (
                    <span className="font-medium">
                      {product.currency || "$"}
                      {product.suggestedPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No price
                    </span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Translations */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.translations.slice(0, 3).map((translation) => (
                      <Badge
                        key={translation.locale}
                        variant="secondary"
                        className="text-xs"
                      >
                        {translation.locale.toUpperCase()}
                      </Badge>
                    ))}
                    {product.translations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.translations.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit product</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete product</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

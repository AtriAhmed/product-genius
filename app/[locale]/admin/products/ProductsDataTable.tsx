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
import { Category, Media, Product, ProductTranslation } from "@/types";

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

  console.log("-------------------- products --------------------");
  console.log(products);

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
      <div className="border rounded-md bg-background">
        <div className="p-8 text-center">
          <div className="w-8 h-8 mx-auto border-primary border-b-2 rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border rounded-md bg-background">
        <div className="p-8 text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-medium text-lg">{t("no products found")}</h3>
          <p className="mb-4 text-muted-foreground">
            {t("try adjusting your search or filters")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-0 min-w-full border rounded-md bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-16 font-medium">Image</TableHead>
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
            const translation = getCurrentTranslation(
              product?.translations || []
            );
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
                  <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md bg-muted">
                    {primaryMedia?.url ? (
                      primaryMedia.type === "IMAGE" ? (
                        <Image
                          src={getMediaUrl(primaryMedia.url)}
                          alt={translation?.title || "Product"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : // For videos, try to show poster first, fallback to video thumbnail
                      primaryMedia.poster ? (
                        <Image
                          src={getMediaUrl(primaryMedia.poster)!}
                          alt={`${
                            translation?.title || "Product"
                          } - Video Thumbnail`}
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
                      <div className="flex justify-center items-center w-full h-full">
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
                      <span className="max-w-xs text-muted-foreground text-xs truncate">
                        {translation.description}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* SKU */}
                <TableCell>
                  {product.sku ? (
                    <code className="px-2 py-1 rounded bg-muted text-xs">
                      {product.sku}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">
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
                    <span className="text-muted-foreground text-xs italic">
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
                    <span className="text-muted-foreground text-xs italic">
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
                    {product?.translations?.slice(0, 3).map((translation) => (
                      <Badge
                        key={translation.locale}
                        variant="secondary"
                        className="text-xs"
                      >
                        {translation?.locale?.toUpperCase()}
                      </Badge>
                    ))}
                    {product?.translations?.length! > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product?.translations?.length! - 3}
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
                      className="w-8 h-8 p-0"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">Edit product</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 className="w-4 h-4" />
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

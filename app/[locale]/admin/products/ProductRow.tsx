"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { getCurrentTranslation } from "@/lib/products";
import { cn, formatPrice, getMediaUrl, htmlToText } from "@/lib/utils";
import { Media, Product } from "@/types";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const locale = useLocale();
  const t = useTranslations("products");

  const translation = getCurrentTranslation(product?.translations || [], locale);
  const categoryTranslation = getCurrentTranslation(product.category?.translations || [], locale);
  const primaryMedia: Media | undefined = product.media?.[0];

  return (
    <TableRow key={product.id} className="border-border hover:bg-muted/50 transition-colors">
      {/* Product Image */}
      <TableCell className="py-1">
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
                alt={`${translation?.title || "Product"} - Video Thumbnail`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={getMediaUrl(primaryMedia.url)} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>

      {/* Product Name */}
      <TableCell className="py-1 font-medium">
        <div className="flex flex-col">
          <span className="font-semibold text-[13px] text-foreground line-clamp-1">{translation?.title || `N/A`}</span>
          {translation?.description && (
            <span className="text-[11px] text-muted-foreground line-clamp-1">
              {htmlToText(translation.description)?.replace(/^product description:?/i, "")}
            </span>
          )}
        </div>
      </TableCell>

      {/* SKU */}
      {/* <TableCell className="py-1">
        {product.sku ? (
          <code className="px-2 py-1 rounded bg-muted text-xs">
            {product.sku}
          </code>
        ) : (
          <span className="text-muted-foreground text-xs italic">
            {t("no sku")}
          </span>
        )}
      </TableCell> */}

      {/* Category */}
      <TableCell className="py-1">
        <Badge variant="outline" className="text-xs">
          {categoryTranslation?.title || "N/A"}
        </Badge>
      </TableCell>

      {/* Price */}
      <TableCell className="py-1">
        {product.price ? (
          <span className="font-medium">{formatPrice(product.price, product.currency)}</span>
        ) : (
          <span className="text-muted-foreground text-xs italic">{t("no price")}</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell className="py-1">
        <Badge
          variant={product.isActive ? "default" : "secondary"}
          className={cn("text-xs", product.isActive ? "bg-green-400 hover:bg-green-500 text-green-900" : "")}
        >
          {product.isActive ? t("active") : t("inactive")}
        </Badge>
      </TableCell>

      {/* Translations */}
      <TableCell className="py-1">
        <div className="flex flex-wrap gap-1">
          {product?.translations?.slice(0, 3).map((tr) => (
            <Badge key={tr.locale} variant="secondary" className="text-xs">
              {tr.locale?.toUpperCase()}
            </Badge>
          ))}
          {product?.translations && product.translations.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.translations.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-1">
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => onEdit(product)}>
            <Edit className="w-4 h-4" />
            <span className="sr-only">{t("edit product")}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">{t("delete product")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

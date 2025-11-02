"use client";

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
import { Trash2, ExternalLink, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductMapping } from "@/types";
import Image from "next/image";
import { format } from "date-fns";
import { getMediaUrl } from "@/lib/utils";

type ImportedProductsDataTableProps = {
  productMappings: ProductMapping[];
  onDelete: (mapping: ProductMapping) => void;
  isLoading: boolean;
};

export default function ImportedProductsDataTable({
  productMappings,
  onDelete,
  isLoading,
}: ImportedProductsDataTableProps) {
  const t = useTranslations("imported-products");

  const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell>
        <div className="w-10 h-10 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="w-32 h-4 rounded bg-muted animate-pulse" />
          <div className="w-16 h-3 rounded bg-muted animate-pulse" />
        </div>
      </TableCell>
      <TableCell>
        <div className="w-24 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="w-28 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="w-20 h-6 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="w-16 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="w-8 h-8 ml-auto rounded bg-muted animate-pulse" />
      </TableCell>
    </TableRow>
  ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={7} className="h-32">
        <div className="flex flex-col justify-center items-center text-muted-foreground text-center">
          <Upload className="w-8 h-8 mb-2" />
          <p className="font-medium text-sm">
            {t("no imported products found")}
          </p>
          <p className="text-xs">
            {t("import products to shopify to see them here")}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("image")}</TableHead>
            <TableHead>{t("product")}</TableHead>
            <TableHead>{t("shopify product id")}</TableHead>
            <TableHead>{t("shopify store")}</TableHead>
            <TableHead>{t("shop")}</TableHead>
            <TableHead>{t("imported at")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : productMappings.length > 0
            ? productMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    {mapping.product?.media?.[0]?.url ? (
                      <div className="w-10 h-10 overflow-hidden rounded">
                        <Image
                          src={getMediaUrl(
                            mapping.product.media[0].type === "IMAGE"
                              ? mapping.product.media[0].url
                              : mapping.product.media[0].poster
                          )}
                          alt={
                            mapping.product.translations?.[0]?.title ||
                            "Product image"
                          }
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          sizes="(max-width: 640px) 40px, 10vw"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-10 h-10 rounded bg-muted">
                        <span className="text-muted-foreground text-xs">
                          No img
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {mapping.product?.translations?.[0]?.title ||
                          "Untitled Product"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        ID: {mapping.product?.id}
                      </div>
                      {mapping.product?.sku && (
                        <div className="text-muted-foreground text-xs">
                          SKU: {mapping.product.sku}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-muted text-sm">
                        {mapping.shopifyProductId}
                      </code>
                      {mapping.shop && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() =>
                            window.open(
                              `https://${mapping.shop}/admin/products/${mapping.shopifyProductId}`,
                              "_blank"
                            )
                          }
                          title="Open in Shopify"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {mapping.shopifyStore?.name || "Unknown Store"}
                      </div>
                      {mapping.shopifyStore?.id && (
                        <div className="text-muted-foreground text-sm">
                          Store ID: {mapping.shopifyStore.id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {mapping.shop?.replace(".myshopify.com", "")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {mapping.createdAt ? (
                      <div className="text-sm">
                        {format(new Date(mapping.createdAt), "MMM dd, yyyy")}
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(mapping.createdAt), "HH:mm")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(mapping)}
                      className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

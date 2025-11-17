"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductMapping } from "@/types";
import Image from "next/image";
import { format } from "date-fns";
import { getMediaUrl } from "@/lib/utils";
import DeleteMappingDialog from "./DeleteMappingDialog";
import axios from "axios";
import { toast } from "sonner";

type ImportedProductsDataTableProps = {
  productMappings: ProductMapping[];
  onRefresh: () => void;
  isLoading: boolean;
};

export default function ImportedProductsDataTable({
  productMappings,
  onRefresh,
  isLoading,
}: ImportedProductsDataTableProps) {
  const t = useTranslations("imported-products");
  const [deleteMapping, setDeleteMapping] = useState<ProductMapping | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMapping = (mapping: ProductMapping) => {
    setDeleteMapping(mapping);
  };

  const confirmDelete = async (deleteFromShopify: boolean) => {
    if (!deleteMapping) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/product-mappings/${deleteMapping.id}?deleteFromShopify=${deleteFromShopify}`);
      toast.success(t("product mapping deleted successfully"));
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting product mapping:", error);
      toast.error(error.response?.data?.error || t("failed to delete imported product"));
    } finally {
      setIsDeleting(false);
      setDeleteMapping(undefined);
    }
  };

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
      <TableCell colSpan={7}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no imported products found")}</h3>
          <p className="mb-4 text-muted-foreground text-sm">{t("import products to shopify to see them here")}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-nowrap">{t("image")}</TableHead>
            <TableHead className="text-nowrap">{t("product")}</TableHead>
            <TableHead className="text-nowrap">{t("shopify product id")}</TableHead>
            <TableHead className="text-nowrap">{t("shopify store")}</TableHead>
            <TableHead className="text-nowrap">{t("shop")}</TableHead>
            <TableHead className="text-nowrap">{t("imported at")}</TableHead>
            <TableHead className="text-right text-nowrap">{t("actions")}</TableHead>
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
                          alt={mapping.product.translations?.[0]?.title || "Product image"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          sizes="(max-width: 640px) 40px, 10vw"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-10 h-10 rounded bg-muted">
                        <span className="text-muted-foreground text-xs">No img</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {mapping.product?.translations?.[0]?.title || "Untitled Product"}
                      </div>
                      <div className="text-muted-foreground text-sm">ID: {mapping.product?.id}</div>
                      {mapping.product?.sku && (
                        <div className="text-muted-foreground text-xs">SKU: {mapping.product.sku}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-muted text-sm">{mapping.shopifyProductId}</code>
                      {mapping.shop && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() =>
                            window.open(`https://${mapping.shop}/admin/products/${mapping.shopifyProductId}`, "_blank")
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
                      <div className="font-medium">{mapping.shopifyStore?.name || "Unknown Store"}</div>
                      {mapping.shopifyStore?.id && (
                        <div className="text-muted-foreground text-sm">Store ID: {mapping.shopifyStore.id}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{mapping.shop?.replace(".myshopify.com", "")}</Badge>
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
                      onClick={() => handleDeleteMapping(mapping)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteMappingDialog
        open={!!deleteMapping}
        onOpenChange={() => setDeleteMapping(undefined)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        productTitle={deleteMapping?.product?.translations?.[0]?.title}
      />
    </div>
  );
}

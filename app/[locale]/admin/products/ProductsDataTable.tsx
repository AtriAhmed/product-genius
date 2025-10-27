"use client";

import ProductRow from "@/app/[locale]/admin/products/ProductRow";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

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

  const renderSkeletonRows = () =>
    Array.from({ length: 4 }).map((_, idx) => (
      <TableRow
        key={`skeleton-${idx}`}
        className="border-border transition-colors"
      >
        {/* Image */}
        <TableCell>
          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md bg-muted">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </TableCell>

        {/* Name + description */}
        <TableCell className="font-medium">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-40 h-4 rounded" />
            <Skeleton className="w-60 max-w-xs h-3 rounded" />
          </div>
        </TableCell>

        {/* SKU */}
        <TableCell>
          <Skeleton className="w-20 h-4 rounded" />
        </TableCell>

        {/* Category */}
        <TableCell>
          <Skeleton className="w-20 h-6 rounded-md" />
        </TableCell>

        {/* Price */}
        <TableCell>
          <Skeleton className="w-24 h-4 rounded" />
        </TableCell>

        {/* Status */}
        <TableCell>
          <Skeleton className="w-16 h-6 rounded-full" />
        </TableCell>

        {/* Translations */}
        <TableCell>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="w-8 h-6 rounded-md" />
            <Skeleton className="w-8 h-6 rounded-md" />
            <Skeleton className="w-8 h-6 rounded-md" />
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className="flex justify-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </TableCell>
      </TableRow>
    ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={8}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-medium text-lg">{t("no products found")}</h3>
          <p className="mb-4 text-muted-foreground">
            {t("try adjusting your search or filters")}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-md bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-16 font-medium">{t("image")}</TableHead>
            <TableHead className="font-medium">{t("name")}</TableHead>
            <TableHead className="font-medium">{t("sku")}</TableHead>
            <TableHead className="font-medium">{t("category")}</TableHead>
            <TableHead className="font-medium">{t("price")}</TableHead>
            <TableHead className="font-medium">{t("status")}</TableHead>
            <TableHead className="font-medium">{t("translations")}</TableHead>
            <TableHead className="font-medium text-center">
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? renderSkeletonRows()
            : products.length > 0
            ? products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

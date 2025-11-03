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
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Eye } from "lucide-react";
import { getCurrentTranslation } from "@/lib/products";

interface CategoryTranslation {
  id: number;
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  translations: CategoryTranslation[];
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoriesDataTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onView: (category: Category) => void;
  isLoading?: boolean;
}

export default function CategoriesDataTable({
  categories,
  onEdit,
  onDelete,
  isLoading = false,
}: CategoriesDataTableProps) {
  const t = useTranslations("categories");

  const skeletonRows = Array.from({ length: 4 }).map((_, idx) => (
    <TableRow
      key={`skeleton-${idx}`}
      className="border-border transition-colors"
    >
      {/* Name */}
      <TableCell className="font-medium">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-40 h-4 rounded" />
          <Skeleton className="w-24 h-3 rounded" />
        </div>
      </TableCell>

      {/* Description */}
      <TableCell>
        <Skeleton className="w-60 max-w-xs h-4 rounded" />
      </TableCell>

      {/* Translations */}
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="w-8 h-6 rounded-md" />
          <Skeleton className="w-8 h-6 rounded-md" />
          <Skeleton className="w-8 h-6 rounded-md" />
        </div>
      </TableCell>

      {/* Products count */}
      <TableCell>
        <Skeleton className="w-20 h-6 rounded-md" />
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
      <TableCell colSpan={5}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-medium text-lg">
            {t("no categories found")}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t("create your first category")}
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
            <TableHead className="font-medium">{t("name")}</TableHead>
            <TableHead className="font-medium">{t("description")}</TableHead>
            <TableHead className="font-medium">{t("translations")}</TableHead>
            <TableHead className="font-medium">Products</TableHead>
            <TableHead className="font-medium text-center">
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : categories.length > 0
            ? categories.map((category) => {
                const primaryTranslation = getCurrentTranslation(
                  category?.translations
                );
                const productCount = category._count?.products || 0;

                return (
                  <TableRow
                    key={category.id}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {primaryTranslation.title}
                        </span>
                        {category.translations.length > 1 && (
                          <span className="text-muted-foreground text-xs">
                            +{category.translations.length - 1} more languages
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs">
                        {primaryTranslation.description &&
                        primaryTranslation.description.trim() ? (
                          <p className="text-muted-foreground text-sm truncate">
                            {primaryTranslation.description}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            No description
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {category.translations
                          .slice(0, 3)
                          .map((translation) => (
                            <Badge
                              key={translation.locale}
                              variant="secondary"
                              className="text-xs"
                            >
                              {translation.locale.toUpperCase()}
                            </Badge>
                          ))}
                        {category.translations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.translations.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={productCount > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {productCount} products
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => onEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit category</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete category</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

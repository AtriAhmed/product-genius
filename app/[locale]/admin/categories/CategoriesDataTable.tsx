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
  onView,
  isLoading = false,
}: CategoriesDataTableProps) {
  const t = useTranslations("categories");

  const getPrimaryTranslation = (category: Category) => {
    // Try to find English translation first, then fall back to the first available
    return (
      category.translations.find((t) => t.locale === "en") ||
      category.translations[0] || {
        title: `Category #${category.id}`,
        description: "",
        locale: "en",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border bg-background">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border bg-background">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {t("no categories found")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("create your first category")}
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
          {categories.map((category) => {
            const primaryTranslation = getPrimaryTranslation(category);
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
                      <span className="text-xs text-muted-foreground">
                        +{category.translations.length - 1} more languages
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="max-w-xs">
                    {primaryTranslation.description &&
                    primaryTranslation.description.trim() ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {primaryTranslation.description}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {category.translations.slice(0, 3).map((translation) => (
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
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit category</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete category</span>
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

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

type ImportedProductsFiltersProps = {
  search: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
};

export default function ImportedProductsFilters({
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortChange,
  onClearFilters,
}: ImportedProductsFiltersProps) {
  const t = useTranslations("imported-products");

  const sortOptions = [
    { value: "createdAt", label: t("created at") },
    { value: "productId", label: t("product id") },
    { value: "shopifyProductId", label: t("shopify product id") },
    { value: "shop", label: t("shop") },
  ];

  const hasActiveFilters = search || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder={t("search products")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Sort By */}
      <div className="min-w-[150px]">
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-");
            onSortChange(newSortBy, newSortOrder);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <div key={option.value}>
                <SelectItem value={`${option.value}-asc`}>{option.label} (A-Z)</SelectItem>
                <SelectItem value={`${option.value}-desc`}>{option.label} (Z-A)</SelectItem>
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <X className="w-4 h-4" />
          {t("clear filters")}
        </Button>
      )}
    </div>
  );
}

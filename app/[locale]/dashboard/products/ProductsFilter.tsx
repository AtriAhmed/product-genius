"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { useTranslations } from "next-intl";

// Product Filters Component
export default function ProductFilters({
  search,
  filter,
  sortBy,
  sortOrder,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: {
  search: string;
  filter: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
}) {
  const t = useTranslations("products");

  const sortOptions = [
    { value: "createdAt-desc", label: t("newest first") },
    { value: "createdAt-asc", label: t("oldest first") },
    { value: "price-desc", label: t("highest price") },
    { value: "price-asc", label: t("lowest price") },
  ];

  const currentSortValue = `${sortBy}-${sortOrder}`;
  //   const hasActiveFilters =
  //     search ||
  //     filter !== "all" ||
  //     sortBy !== "createdAt" ||
  //     sortOrder !== "desc";

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
        <Input
          placeholder={t("search products")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <Select
        value={currentSortValue}
        onValueChange={(value) => {
          const [newSortBy, newSortOrder] = value.split("-");
          onSortChange(newSortBy, newSortOrder);
        }}
      >
        <SelectTrigger className="">
          {sortOrder === "asc" ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {/* {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="lg:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          {t("clear filters")}
        </Button>
      )} */}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, SortAsc, SortDesc, X } from "lucide-react";
import { useTranslations } from "next-intl";

// Filters Component
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
    { value: "title-asc", label: t("a-z") },
    { value: "title-desc", label: t("z-a") },
    { value: "suggestedPrice-desc", label: t("highest price") },
    { value: "suggestedPrice-asc", label: t("lowest price") },
  ];

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const hasActiveFilters = search || filter !== "all" || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="flex lg:flex-row flex-col gap-4 pb-2">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
        <Input
          placeholder={t("search products")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full lg:w-48">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all products")}</SelectItem>
          <SelectItem value="active">{t("active products")}</SelectItem>
          <SelectItem value="inactive">{t("inactive products")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={currentSortValue}
        onValueChange={(value) => {
          const [newSortBy, newSortOrder] = value.split("-");
          onSortChange(newSortBy, newSortOrder);
        }}
      >
        <SelectTrigger className="w-full lg:w-48">
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
      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} className="lg:w-auto">
          <X className="w-4 h-4 mr-2" />
          {t("clear filters")}
        </Button>
      )}
    </div>
  );
}

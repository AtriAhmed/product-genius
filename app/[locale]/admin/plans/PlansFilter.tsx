"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, SortAsc, SortDesc, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PlansFilter({
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
  const t = useTranslations("plans");

  const sortOptions = [
    { value: "sortOrder-asc", label: t("newest first") },
    { value: "createdAt-desc", label: t("newest first") },
    { value: "createdAt-asc", label: t("oldest first") },
    { value: "name-asc", label: t("a-z") },
    { value: "name-desc", label: t("z-a") },
    { value: "price-desc", label: t("highest price") },
    { value: "price-asc", label: t("lowest price") },
  ];

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const hasActiveFilters =
    search || filter !== "all" || sortBy !== "sortOrder" || sortOrder !== "asc";

  return (
    <div className="flex flex-col lg:flex-row gap-4 pb-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t("search plans")}
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
          <SelectItem value="all">{t("all plans")}</SelectItem>
          <SelectItem value="active">{t("active plans")}</SelectItem>
          <SelectItem value="inactive">{t("inactive plans")}</SelectItem>
          <SelectItem value="popular">{t("popular plans")}</SelectItem>
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
          {sortOrder === "asc" ? (
            <SortAsc className="w-4 h-4 mr-2" />
          ) : (
            <SortDesc className="w-4 h-4 mr-2" />
          )}
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
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="lg:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          {t("clear filters")}
        </Button>
      )}
    </div>
  );
}

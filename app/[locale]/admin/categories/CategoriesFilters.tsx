"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";

interface CategoriesFiltersProps {
  search: string;
  filter: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
}

export default function CategoriesFilters({
  search,
  filter,
  sortBy,
  sortOrder,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: CategoriesFiltersProps) {
  const t = useTranslations("categories");

  const hasActiveFilters =
    search ||
    filter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("_");
    onSortChange(field, order);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-28 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search categories")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Filter */}
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder={t("filter by")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="with_products">
                {t("with products")}
              </SelectItem>
              <SelectItem value="without_products">
                {t("without products")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={`${sortBy}_${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder={t("sort by")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">
                {t("newest first")}
              </SelectItem>
              <SelectItem value="createdAt_asc">{t("oldest first")}</SelectItem>
              <SelectItem value="name_asc">{t("name ascending")}</SelectItem>
              <SelectItem value="name_desc">{t("name descending")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              {t("clear filters")}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{search}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Filter:{" "}
              {filter === "with_products"
                ? t("with products")
                : t("without products")}
              <button
                onClick={() => onFilterChange("all")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

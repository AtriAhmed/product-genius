"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SortAsc, SortDesc, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FaqsFilter({
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortChange,
  onClearFilters,
}: {
  search: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
}) {
  const t = useTranslations("faqs");

  const sortOptions = [
    { value: "order-asc", label: t("order ascending") },
    { value: "order-desc", label: t("order descending") },
    { value: "question-asc", label: t("a-z") },
    { value: "question-desc", label: t("z-a") },
    { value: "createdAt-desc", label: t("newest first") },
    { value: "createdAt-asc", label: t("oldest first") },
  ];

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const hasActiveFilters = search || sortBy !== "order" || sortOrder !== "asc";

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
        <Input
          placeholder={t("search faqs")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

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

      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} className="lg:w-auto">
          <X className="w-4 h-4 mr-2" />
          {t("clear filters")}
        </Button>
      )}
    </div>
  );
}

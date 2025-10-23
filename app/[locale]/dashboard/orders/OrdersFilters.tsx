"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

type OrdersFiltersProps = {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
};

export default function OrdersFilters({
  search,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
}: OrdersFiltersProps) {
  const t = useTranslations("orders");

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onSortChange(newSortBy, newSortOrder);
  };

  const hasActiveFilters =
    search ||
    status !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {/* Search */}
      <div className="relative grow sm:min-w-[200px]">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
        <Input
          placeholder={t("search orders")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("filter by status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all statuses")}</SelectItem>
          <SelectItem value="DRAFT">{t("draft")}</SelectItem>
          <SelectItem value="PENDING">{t("pending")}</SelectItem>
          <SelectItem value="PAID">{t("paid")}</SelectItem>
          <SelectItem value="PROCESSING">{t("processing")}</SelectItem>
          <SelectItem value="COMPLETED">{t("completed")}</SelectItem>
          <SelectItem value="CANCELED">{t("canceled")}</SelectItem>
          <SelectItem value="REFUNDED">{t("refunded")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("sort by")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="orderNumber-asc">Order Number A-Z</SelectItem>
          <SelectItem value="orderNumber-desc">Order Number Z-A</SelectItem>
          <SelectItem value="totalCents-desc">Highest Amount</SelectItem>
          <SelectItem value="totalCents-asc">Lowest Amount</SelectItem>
        </SelectContent>
      </Select>

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

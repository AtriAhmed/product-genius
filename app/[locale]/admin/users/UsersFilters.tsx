"use client";

import { Search, Filter, X } from "lucide-react";
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

type UsersFiltersProps = {
  search: string;
  role: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (search: string) => void;
  onRoleChange: (role: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
};

export default function UsersFilters({
  search,
  role,
  sortBy,
  sortOrder,
  onSearchChange,
  onRoleChange,
  onSortChange,
  onClearFilters,
}: UsersFiltersProps) {
  const t = useTranslations("users");

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onSortChange(newSortBy, newSortOrder);
  };

  const hasActiveFilters =
    search || role !== "all" || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="space-y-4 mb-6 p-6 border rounded-lg bg-card shadow-sm">
      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
        <Filter className="w-4 h-4" />
        Filters & Search
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative grow sm:min-w-[200px]">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
          <Input
            placeholder={t("search users")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role Filter */}
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("filter by role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all roles")}</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="EDITOR">Editor</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="USER">User</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("sort by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="email-asc">Email A-Z</SelectItem>
            <SelectItem value="email-desc">Email Z-A</SelectItem>
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
    </div>
  );
}

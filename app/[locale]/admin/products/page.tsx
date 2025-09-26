"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, SortAsc, SortDesc, X } from "lucide-react";
import ProductsDataTable from "./ProductsDataTable";

interface ProductTranslation {
  id: number;
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  translations: {
    id: number;
    locale: string;
    title: string;
    description: string;
  }[];
}

interface Media {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
}

interface Product {
  id: number;
  sku?: string;
  suggestedPrice?: number;
  currency?: string;
  isActive: boolean;
  translations: ProductTranslation[];
  media: Media[];
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ApiErrorResponse {
  error: string;
}

// Filters Component
function ProductFilters({
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
  const hasActiveFilters =
    search ||
    filter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="flex flex-col lg:flex-row gap-4 pb-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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

export default function ProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Helper function for client-side sorting
  const getCurrentTranslation = (
    translations: ProductTranslation[],
    locale = "en"
  ) => {
    return (
      translations.find((t) => t.locale === locale) || translations[0] || null
    );
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        isActive:
          filter === "all" ? "" : filter === "active" ? "true" : "false",
        // Note: API doesn't support sorting by title directly, so we'll handle basic sorting
      });

      const response = await fetch(`/api/products?${params}`);

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        let sortedProducts = data.products;

        // Client-side sorting for unsupported API sorts
        if (sortBy === "title") {
          sortedProducts = [...data.products].sort((a, b) => {
            const aTitle = getCurrentTranslation(a.translations)?.title || "";
            const bTitle = getCurrentTranslation(b.translations)?.title || "";
            const comparison = aTitle.localeCompare(bTitle);
            return sortOrder === "asc" ? comparison : -comparison;
          });
        } else if (sortBy === "suggestedPrice") {
          sortedProducts = [...data.products].sort((a, b) => {
            const aPrice = a.suggestedPrice || 0;
            const bPrice = b.suggestedPrice || 0;
            return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
          });
        }

        setProducts(sortedProducts);
        setPagination(data.pagination);
      } else {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, filter, sortBy, sortOrder, pagination.page]);

  const handleAddProduct = () => {
    router.push("/admin/products/new");
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
  };

  const handleDeleteProduct = (product: Product) => {
    // For now, just show a toast - implement delete logic later
    toast.error("Delete functionality not yet implemented");
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-2 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("products")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("manage your products and translations")}
            </p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="w-4 h-4" />
            {t("add product")}
          </Button>
        </div>

        {/* Filters */}
        <ProductFilters
          search={search}
          filter={filter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Products Data Table */}
        <ProductsDataTable
          products={products}
          onView={handleViewProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          isLoading={isLoading}
        />

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t("showing results", {
              start: (pagination.page - 1) * pagination.limit + 1,
              end: Math.min(
                pagination.page * pagination.limit,
                pagination.total
              ),
              total: pagination.total,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

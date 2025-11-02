"use client";

import { useState, useEffect } from "react";
import { ProductMapping } from "@/types";
import { useTranslations } from "next-intl";
import Pagination from "@/components/Pagination";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import ImportedProductsFilters from "./ImportedProductsFilters";
import ImportedProductsDataTable from "./ImportedProductsDataTable";

type ProductMappingsResponse = {
  data: ProductMapping[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

async function fetcher(
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string
) {
  const params: any = { page, limit };

  if (search.trim()) params.search = search.trim();
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  const response = await axios.get("/api/product-mappings", { params });
  return response.data;
}

export default function ImportedProductsPage() {
  const t = useTranslations("imported-products");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(search, 300);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<ProductMappingsResponse>(
    ["product-mappings", page, limit, debouncedSearch, sortBy, sortOrder],
    () => fetcher(page, limit, debouncedSearch, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Get product mappings from SWR data
  const productMappings = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  useEffect(() => {
    if (error) {
      console.error("Product mappings fetch error:", error);
      toast.error(t("failed to load product mappings"));
    }
  }, [error, t]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {t("imported products")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("manage imported products")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <ImportedProductsFilters
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
          }}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Product Mappings Data Table */}
        <ImportedProductsDataTable
          productMappings={productMappings}
          onRefresh={mutate}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {!isLoading && productMappings.length > 0 && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}

        {/* Results Count */}
        {!isLoading && productMappings.length > 0 && (
          <div className="mt-4 text-muted-foreground text-sm text-center">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

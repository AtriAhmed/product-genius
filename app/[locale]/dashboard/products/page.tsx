"use client";

import ProductsGrid from "@/app/[locale]/dashboard/products/ProductsGrid";
import ProductFilters from "@/app/[locale]/dashboard/products/ProductsFilter";
import Pagination from "@/components/Pagination";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";
import { Product } from "@/types";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";
import { useDebounce } from "use-debounce";
import { getCurrentTranslation } from "@/lib/products";

interface ProductsResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

async function fetcher(page: number, limit: number, search: string, isActive: boolean | undefined) {
  const response = await axios.get("/api/products", {
    params: { page, limit, search, isActive: isActive },
  });
  return response.data;
}

export default function UserProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const params = useParams();
  const { resetBreadcrumbs, locale } = useBreadcrumb();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [filter, setFilter] = useState("active"); // Users only see active products by default
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 30; // Show 12 products per page in card layout

  const isActive = filter === "all" ? undefined : filter === "active" ? true : false;

  // SWR hook for data fetching
  const { data, error, isLoading } = useSWR<ProductsResponse>(
    ["products", page, limit, debouncedSearch, isActive],
    () => fetcher(page, limit, debouncedSearch, isActive),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, sortBy, sortOrder]);

  // Process and sort products from SWR data
  const getProcessedProducts = (): Product[] => {
    if (!data?.data) return [];

    let sortedProducts = [...data.data];

    // Client-side sorting for unsupported API sorts
    if (sortBy === "title") {
      sortedProducts = sortedProducts.sort((a, b) => {
        const aTitle = getCurrentTranslation(a?.translations || [])?.title || "";
        const bTitle = getCurrentTranslation(b?.translations || [])?.title || "";
        const comparison = aTitle.localeCompare(bTitle);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "suggestedPrice") {
      sortedProducts = sortedProducts.sort((a, b) => {
        const aPrice = a.sellingPrice || 0;
        const bPrice = b.sellingPrice || 0;
        return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
      });
    }

    return sortedProducts;
  };

  const products = getProcessedProducts();
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 30,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load products"));
  }

  const clearFilters = () => {
    setSearch("");
    setFilter("active");
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
        <div className="mb-8">
          <h1 className="font-bold text-3xl tracking-tight">{t("products")}</h1>
          <p className="mt-2 text-muted-foreground">{t("discover our amazing collection of products")}</p>
        </div>

        {/* Filters */}
        <ProductFilters
          search={search}
          filter={filter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1);
          }}
          onFilterChange={(newFilter) => {
            setFilter(newFilter);
            setPage(1);
          }}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Products Grid */}
        <ProductsGrid products={products} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && products.length > 0 && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
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

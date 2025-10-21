"use client";

import ProductCard from "@/app/[locale]/dashboard/products/ProductCard";
import ProductFilters from "@/app/[locale]/dashboard/products/ProductsFilter";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";
import { Product, ProductTranslation } from "@/types";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";
import { useDebounce } from "use-debounce";

interface ProductsResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

async function fetcher(
  page: number,
  limit: number,
  search: string,
  isActive: boolean | undefined
) {
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
  const limit = 12; // Show 12 products per page in card layout

  const isActive =
    filter === "all" ? undefined : filter === "active" ? true : false;

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

  // Helper function for client-side sorting
  const getCurrentTranslation = (
    translations: ProductTranslation[],
    locale = "en"
  ) => {
    return (
      translations.find((t) => t.locale === locale) || translations[0] || null
    );
  };

  // Process and sort products from SWR data
  const getProcessedProducts = (): Product[] => {
    if (!data?.data) return [];

    let sortedProducts = [...data.data];

    // Client-side sorting for unsupported API sorts
    if (sortBy === "title") {
      sortedProducts = sortedProducts.sort((a, b) => {
        const aTitle =
          getCurrentTranslation(a?.translations || [])?.title || "";
        const bTitle =
          getCurrentTranslation(b?.translations || [])?.title || "";
        const comparison = aTitle.localeCompare(bTitle);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "suggestedPrice") {
      sortedProducts = sortedProducts.sort((a, b) => {
        const aPrice = a.suggestedPrice || 0;
        const bPrice = b.suggestedPrice || 0;
        return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
      });
    }

    return sortedProducts;
  };

  const products = getProcessedProducts();
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 12,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load products"));
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/${locale}/dashboard/products/${product.id}`);
  };

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("products")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("discover our amazing collection of products")}
          </p>
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

        {/* Products Grid */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {t("loading products")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("no products found")}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? t("try adjusting your search criteria")
                : t("no products available at the moment")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={handleViewProduct}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && pagination.pages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {t("previous")}
            </Button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNumber;
              if (pagination.pages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= pagination.pages - 2) {
                pageNumber = pagination.pages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              disabled={page === pagination.pages}
              onClick={() => handlePageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
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

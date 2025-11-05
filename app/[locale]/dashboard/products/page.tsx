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
import { getCurrentTranslation } from "@/lib/products";

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
      <div className="">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-bold text-3xl tracking-tight">{t("products")}</h1>
          <p className="mt-2 text-muted-foreground">
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
            <div className="w-8 h-8 mx-auto border-primary border-b-2 rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">
              {t("loading products")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex justify-center items-center w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">
              {t("no products found")}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? t("try adjusting your search criteria")
                : t("no products available at the moment")}
            </p>
          </div>
        ) : (
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="flex justify-center gap-2 mt-12">
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
          <div className="mt-8 text-muted-foreground text-sm text-center">
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

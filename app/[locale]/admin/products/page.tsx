"use client";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Product, ProductTranslation } from "@/types";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";
import ProductsDataTable from "./ProductsDataTable";
import ProductFilters from "@/app/[locale]/admin/products/ProductsFilter";

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function fetcher(
  page: number,
  limit: number,
  search: string,
  isActive: boolean | undefined
) {
  const response = await axios.get("/api/products", {
    params: { page, limit, search, active: isActive },
  });
  return response.data;
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const [deleteProduct, setDeleteProduct] = useState<Product | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  const isActive =
    filter === "all" ? undefined : filter === "active" ? true : false;

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    ["products", page, limit, search, isActive],
    () => fetcher(page, limit, search, isActive),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

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
    if (!data?.products) return [];

    let sortedProducts = [...data.products];

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
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  };

  // Handle SWR error
  if (error) {
    toast.error("Failed to load products");
  }

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
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;

    try {
      await axios.delete(`/api/products/${deleteProduct.id}`);
      toast.success("Product deleted successfully");
      mutate();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    } finally {
      setDeleteProduct(undefined);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
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
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
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

        {/* Pagination */}
        {!isLoading && products.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
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
                  size="sm"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(undefined)}
        title="Delete Product"
        description={`Are you sure you want to delete "${
          deleteProduct?.translations?.[0]?.title || "this product"
        }"?`}
        warningMessage="This action cannot be undone."
        confirmText="Delete Product"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}

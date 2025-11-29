"use client";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import Pagination from "@/components/Pagination";
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
    params: { page, limit, search, isActive },
  });
  return response.data;
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const [deleteProduct, setDeleteProduct] = useState<Product | undefined>();
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 50;

  const isActive = filter === "all" ? undefined : filter === "active" ? true : false;

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    ["products", page, limit, search, isActive],
    () => fetcher(page, limit, search, isActive),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const products = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 50,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error("Failed to load products");
  }

  const confirmDelete = async () => {
    if (!deleteProduct) return;

    setIsDeletingProduct(true);
    try {
      await axios.delete(`/api/products/${deleteProduct.id}`);
      toast.success("Product deleted successfully");
      mutate();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setIsDeletingProduct(false);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">{t("products")}</h1>
            <p className="mt-2 text-muted-foreground">{t("manage your products and translations")}</p>
          </div>
          <Button onClick={() => router.push("/admin/products/new")} className="gap-2" variant="primary">
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
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1);
          }}
          onFilterChange={(newFilter) => {
            setFilter(newFilter);
            setPage(1);
          }}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          onClearFilters={clearFilters}
        />

        {/* Products Data Table */}
        <ProductsDataTable
          products={products}
          onView={(product) => router.push(`/admin/products/${product.id}`)}
          onEdit={(product) => router.push(`/admin/products/${product.id}`)}
          onDelete={setDeleteProduct}
          isLoading={isLoading}
        />

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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(undefined)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.translations?.[0]?.title || "this product"}"?`}
        alertMessage="This action cannot be undone."
        confirmText="Delete Product"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
        isLoading={isDeletingProduct}
      />
    </div>
  );
}

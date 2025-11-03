"use client";

import CategoriesDataTable from "@/app/[locale]/admin/categories/CategoriesDataTable";
import CategoriesFilters from "@/app/[locale]/admin/categories/CategoriesFilters";
import CategoryForm from "@/app/[locale]/admin/categories/CategoryForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";

interface CategoryTranslation {
  id: number;
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  translations: CategoryTranslation[];
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  categories: Category[];
}

async function fetcher(
  search: string,
  filter: string,
  sortBy: string,
  sortOrder: string
) {
  const params = new URLSearchParams({
    search,
    filter,
    sortBy,
    sortOrder,
  });

  const response = await axios.get(`/api/categories?${params}`);
  return response.data;
}

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [deleteCategory, setDeleteCategory] = useState<Category | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const isMobile = useIsMobile();

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>(
    ["categories", search, filter, sortBy, sortOrder],
    () => fetcher(search, filter, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const categories = data?.categories || [];

  // Handle SWR error
  if (error) {
    toast.error("Failed to load categories");
  }

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    if (isMobile) {
      setIsFormOpen(true);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    if (isMobile) {
      setIsFormOpen(true);
    }
  };

  const handleViewCategory = (category: Category) => {
    // For now, just open edit form - could be expanded to view-only mode
    handleEditCategory(category);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteCategory(category);
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;

    try {
      await axios.delete(`/api/categories/${deleteCategory.id}`);
      toast.success(t("category deleted successfully"));
      mutate();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : t("failed to delete category")
      );
    } finally {
      setDeleteCategory(undefined);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
    mutate();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
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
      <div className="mx-auto px-4 py-4 container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {t("categories")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your product categories and translations
            </p>
          </div>
          <Button
            onClick={handleAddCategory}
            className="lg:hidden gap-2 ms-auto"
          >
            <Plus className="w-4 h-4" />
            {t("add category")}
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Data Table and Filters */}
          <div className="flex-1">
            {/* Filters and Search */}
            <CategoriesFilters
              search={search}
              filter={filter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={setSearch}
              onFilterChange={setFilter}
              onSortChange={handleSortChange}
              onClearFilters={clearFilters}
            />

            {/* Data Table */}
            <CategoriesDataTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onView={handleViewCategory}
              isLoading={isLoading}
            />

            {/* Results Count */}
            {!isLoading && categories.length > 0 && (
              <div className="mt-4 text-muted-foreground text-sm text-center">
                {t("showing results", {
                  start: 1,
                  end: categories.length,
                  total: categories.length,
                })}
              </div>
            )}
          </div>

          {/* Right Column - Category Form (hidden on mobile) */}
          <div className="hidden lg:block flex-shrink-0 w-96">
            <div className="border border-border rounded-lg bg-background">
              <div className="p-6">
                <h2 className="mb-4 font-semibold text-xl">
                  {selectedCategory ? t("edit category") : t("add category")}
                </h2>
                <CategoryForm
                  category={selectedCategory}
                  onSuccess={handleFormSuccess}
                  onClose={handleFormClose}
                  isOpen={true}
                  isEmbedded={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Category Form Sidebar */}
      <div className="lg:hidden">
        <CategoryForm
          category={selectedCategory}
          onSuccess={handleFormSuccess}
          onClose={handleFormClose}
          isOpen={isFormOpen}
          isEmbedded={false}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(undefined)}
        title={t("delete category")}
        description={t("are you sure delete")}
        alertTitle={
          deleteCategory?._count?.products && deleteCategory._count.products > 0
            ? "Category has assigned products"
            : undefined
        }
        alertMessage={
          deleteCategory?._count?.products && deleteCategory._count.products > 0
            ? `This category has ${deleteCategory._count.products} product(s) assigned to it. You cannot delete a category that has products.`
            : t("this action cannot be undone")
        }
        confirmText={t("confirm delete")}
        cancelText={t("cancel")}
        onConfirm={confirmDelete}
        variant="destructive"
        disabled={Boolean(
          deleteCategory?._count?.products && deleteCategory._count.products > 0
        )}
      />
    </div>
  );
}

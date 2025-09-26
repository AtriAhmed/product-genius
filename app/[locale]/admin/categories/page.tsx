"use client";

import CategoriesDataTable from "@/app/[locale]/admin/categories/CategoriesDataTable";
import CategoriesFilters from "@/app/[locale]/admin/categories/CategoriesFilters";
import CategoryForm from "@/app/[locale]/admin/categories/CategoryForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        filter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/categories?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      } else {
        throw new Error(data.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, filter, sortBy, sortOrder]);

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
      const response = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("category deleted successfully"));
        fetchCategories();
      } else {
        throw new Error(data.error || "Failed to delete category");
      }
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
    fetchCategories();
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
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-2 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("categories")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your product categories and translations
            </p>
          </div>
          <Button
            onClick={handleAddCategory}
            className="gap-2 lg:hidden ms-auto"
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
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {t("showing results", {
                  start: 1,
                  end: categories.length,
                  total: categories.length,
                })}
              </div>
            )}
          </div>

          {/* Right Column - Category Form (hidden on mobile) */}
          <div className="hidden lg:block w-96 flex-shrink-0">
            <div className="bg-background border border-border rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
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
        warningTitle={
          deleteCategory?._count?.products && deleteCategory._count.products > 0
            ? "Category has assigned products"
            : undefined
        }
        warningMessage={
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

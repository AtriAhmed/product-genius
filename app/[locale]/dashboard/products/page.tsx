"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Heart,
  Star,
  ShoppingCart,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { MainLoader } from "@/components/Loaders";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";

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

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

const currencyMap = Object.fromEntries(
  currencies.map((currency) => [currency.code, currency])
);

// Product Card Component
function ProductCard({
  product,
  onView,
}: {
  product: Product;
  onView: (product: Product) => void;
}) {
  const t = useTranslations("products");

  const getCurrentTranslation = (
    translations: ProductTranslation[],
    locale = "en"
  ) => {
    return (
      translations.find((t) => t.locale === locale) || translations[0] || null
    );
  };

  const translation = getCurrentTranslation(product.translations);
  const mainMedia = product.media[0];
  const categoryTranslation =
    product.category?.translations?.find((t) => t.locale === "en") ||
    product.category?.translations?.[0];

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden pt-0 pb-2 gap-2"
      onClick={() => onView(product)}
    >
      <div className="h-[200px] relative overflow-hidden bg-gray-100">
        {mainMedia ? (
          mainMedia?.type === "IMAGE" ? (
            <Image
              src={getMediaUrl(mainMedia.url)}
              alt={translation?.title || "Product"}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={getMediaUrl(mainMedia.url)}
                className="w-full h-full object-cover"
              />
              {/* Video Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                <div className="bg-black/60 rounded-full p-3 group-hover:bg-black/80 transition-all duration-300 backdrop-blur-sm">
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {translation?.title || "Untitled"}
            </h3>
          </div>

          {categoryTranslation && (
            <Badge variant="secondary" className="text-xs">
              {categoryTranslation.title}
            </Badge>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3">
            {translation?.description}
          </p>

          <div className="flex justify-between items-center flex-wrap gap-2">
            {product.suggestedPrice && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {currencyMap[product.currency!]?.symbol || product.currency}
                  {product.suggestedPrice}
                </span>
              </div>
            )}
            <span className="ms-auto px-2 py-1 rounded-sm bg-primary-500 hover:bg-primary-500/90 text-white text-[11px] font-medium">
              {t("view supplier")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Filters Component
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
  //   const hasActiveFilters =
  //     search ||
  //     filter !== "all" ||
  //     sortBy !== "createdAt" ||
  //     sortOrder !== "desc";

  return (
    <div className="flex flex-col lg:flex-row gap-4 pb-6">
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
      {/* {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="lg:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          {t("clear filters")}
        </Button>
      )} */}
    </div>
  );
}

export default function UserProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const params = useParams();
  const { resetBreadcrumbs, locale } = useBreadcrumb();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active"); // Users only see active products by default
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Show 12 products per page in card layout
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
        isActive: filter === "all" ? "" : "true", // Users mostly see active products
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
            return sortOrder === "asc"
              ? aTitle.localeCompare(bTitle)
              : bTitle.localeCompare(aTitle);
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
        const errorData = await response.json();
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

  const handleViewProduct = (product: Product) => {
    router.push(`/${locale}/dashboard/products/${product.id}`);
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("active");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("products")}</h1>
          <p className="text-muted-foreground mt-2">
            Discover our amazing collection of products
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
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {search
                ? "Try adjusting your search criteria"
                : "No products available at the moment"}
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
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNumber;
              if (pagination.pages <= 5) {
                pageNumber = i + 1;
              } else if (pagination.page <= 3) {
                pageNumber = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNumber = pagination.pages - 4 + i;
              } else {
                pageNumber = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={
                    pagination.page === pageNumber ? "default" : "outline"
                  }
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
          </div>
        )}
      </div>
    </div>
  );
}

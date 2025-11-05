"use client";

import ProductCard from "@/app/[locale]/dashboard/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
}

export default function ProductsGrid({
  products,
  isLoading = false,
}: ProductsGridProps) {
  const t = useTranslations("products");

  // Skeleton loading cards
  const skeletonCards = Array.from({ length: 12 }).map((_, idx) => (
    <div
      key={`skeleton-${idx}`}
      className="overflow-hidden border border-border rounded-lg bg-card shadow-sm text-card-foreground"
    >
      {/* Media skeleton */}
      <div className="relative h-[200px] bg-muted">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Category badge */}
        <Skeleton className="w-20 h-5 rounded-full" />

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-3/4 h-5" />
        </div>

        {/* Price */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-8 h-6 rounded-full" />
        </div>
      </div>
    </div>
  ));

  // Empty state
  const emptyState = (
    <div className="col-span-full py-16 text-center">
      <div className="flex justify-center items-center w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="mb-2 font-semibold text-lg">{t("no products found")}</h3>
      <p className="text-muted-foreground">
        {t("try adjusting your search criteria")}
      </p>
    </div>
  );

  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? skeletonCards
        : products.length > 0
        ? products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        : emptyState}
    </div>
  );
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  appendItem: (item: BreadcrumbItem) => void;
  reset: () => void;
  createBreadcrumbItem: (
    label: string,
    path: string,
    isLast?: boolean
  ) => BreadcrumbItem;
  createProductBreadcrumbs: (
    productTitle: string,
    categoryTitle?: string,
    productId?: number,
    categoryId?: number
  ) => BreadcrumbItem[];
  createAdminProductBreadcrumbs: (
    productTitle: string,
    categoryTitle?: string,
    productId?: number,
    categoryId?: number
  ) => BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  resetBreadcrumbs: () => void;
  locale: string;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const locale = useLocale();

  const appendItem = (item: BreadcrumbItem) => {
    setItems((prev) => [...prev, item]);
  };

  const reset = () => {
    setItems([]);
  };

  const createBreadcrumbItem = (
    label: string,
    path: string,
    isLast: boolean = false
  ): BreadcrumbItem => ({
    label,
    href: `/${locale}${path}`,
    isLast,
  });

  const createProductBreadcrumbs = (
    productTitle: string,
    categoryTitle?: string,
    productId?: number,
    categoryId?: number
  ) => {
    const breadcrumbs: BreadcrumbItem[] = [
      createBreadcrumbItem("Dashboard", "/dashboard"),
      createBreadcrumbItem("Products", "/dashboard/products"),
    ];

    if (categoryTitle && categoryId) {
      breadcrumbs.push(
        createBreadcrumbItem(
          categoryTitle,
          `/dashboard/products?category=${categoryId}`
        )
      );
    }

    if (productTitle && productId) {
      breadcrumbs.push(
        createBreadcrumbItem(
          productTitle,
          `/dashboard/products/${productId}`,
          true
        )
      );
    }

    return breadcrumbs;
  };

  const createAdminProductBreadcrumbs = (
    productTitle: string,
    categoryTitle?: string,
    productId?: number,
    categoryId?: number
  ) => {
    const breadcrumbs: BreadcrumbItem[] = [
      createBreadcrumbItem("Dashboard", "/dashboard"),
      createBreadcrumbItem("Products", "/dashboard/products"),
    ];

    if (categoryTitle && categoryId) {
      breadcrumbs.push(
        createBreadcrumbItem(
          categoryTitle,
          `/dashboard/products?category=${categoryId}`
        )
      );
    }

    if (productTitle && productId) {
      breadcrumbs.push(
        createBreadcrumbItem(
          productTitle,
          `/dashboard/products/${productId}`,
          true
        )
      );
    }

    return breadcrumbs;
  };

  const setBreadcrumbs = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  const resetBreadcrumbs = () => {
    setItems([]);
  };

  return (
    <BreadcrumbContext.Provider
      value={{
        items,
        setItems: setBreadcrumbs,
        appendItem,
        reset,
        createBreadcrumbItem,
        createProductBreadcrumbs,
        setBreadcrumbs,
        resetBreadcrumbs,
        locale,
        createAdminProductBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}

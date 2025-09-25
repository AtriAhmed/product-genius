"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { usePathname } from "next/navigation";

// Mapping of routes to breadcrumb labels
const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/products/new": "Add Product",
  "/dashboard/products/import": "Import Products",
  "/dashboard/products/analytics": "Product Analytics",
  "/dashboard/categories": "Categories",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const isMounted = useIsMounted();

  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbItems = [];
  let currentPath = "";

  // Add subsequent segments
  for (let i = 1; i < segments.length; i++) {
    currentPath += "/" + segments[i];
    const label = routeLabels[currentPath];
    const isLast = i === segments.length - 1;

    breadcrumbItems.push({
      label,
      href: currentPath,
      isLast,
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {!isMounted || item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

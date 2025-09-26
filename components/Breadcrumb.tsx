"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

// Mapping of routes to breadcrumb labels (used as fallback)
const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/products/import": "Import Products",
  "/dashboard/products/analytics": "Product Analytics",
  "/dashboard/categories": "Categories",
  // Admin routes
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/subscriptions": "Subscriptions",
  "/admin/plans": "Plans",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
  "/admin/profile": "Profile",
  "/admin/notifications": "Notifications",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const { items: contextItems, reset } = useBreadcrumb();
  const locale = useLocale();

  // If we have context items (dynamic breadcrumbs), use those
  if (contextItems.length > 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {contextItems.map((item, index) => (
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

  // Fallback to static breadcrumbs for routes not using the context
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = [];
  let currentPath = "";

  // Skip locale segment and add subsequent segments
  for (let i = 0; i < segments.length; i++) {
    currentPath += "/" + segments[i];
    const fullPath = `/${locale}${currentPath}`;
    const label = routeLabels[currentPath];
    const isLast = i === segments.length - 1;

    // Only add items that have labels (skip dynamic routes like [id])
    if (label) {
      breadcrumbItems.push({
        label,
        href: fullPath,
        isLast,
      });
    }
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

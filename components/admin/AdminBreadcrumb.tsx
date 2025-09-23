"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mapping of routes to breadcrumb labels
const routeLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/products/import": "Import Products",
  "/admin/products/analytics": "Product Analytics",
  "/admin/categories": "Categories",
  "/admin/categories/new": "Add Category",
  "/admin/categories/translations": "Category Translations",
  "/admin/media": "Media Library",
  "/admin/media/upload": "Upload Media",
  "/admin/suppliers": "Suppliers",
  "/admin/suppliers/new": "Add Supplier",
  "/admin/suppliers/products": "Supplier Products",
  "/admin/orders": "Orders",
  "/admin/shipments": "Shipments",
  "/admin/shipments/methods": "Shipping Methods",
  "/admin/shipments/tracking": "Track Shipments",
  "/admin/users": "Users",
  "/admin/users/new": "Add User",
  "/admin/users/roles": "User Roles",
  "/admin/users/temp": "Temp Accounts",
  "/admin/agents": "Agents",
  "/admin/agents/profiles": "Agent Profiles",
  "/admin/agents/orders": "Assigned Orders",
  "/admin/subscriptions": "Subscriptions",
  "/admin/subscriptions/plans": "Plans",
  "/admin/subscriptions/plans/new": "Add Plan",
  "/admin/subscriptions/analytics": "Subscription Analytics",
  "/admin/payments": "Payments",
  "/admin/payments/reports": "Payment Reports",
  "/admin/payments/refunds": "Refunds",
  "/admin/reports": "Reports",
  "/admin/reports/sales": "Sales Reports",
  "/admin/reports/users": "User Reports",
  "/admin/reports/products": "Product Reports",
  "/admin/analytics": "Analytics",
  "/admin/analytics/revenue": "Revenue Analytics",
  "/admin/analytics/users": "User Analytics",
  "/admin/analytics/products": "Product Performance",
  "/admin/settings": "Settings",
  "/admin/settings/general": "General Settings",
  "/admin/settings/payments": "Payment Settings",
  "/admin/settings/email": "Email Settings",
  "/admin/settings/api": "API Settings",
  "/admin/profile": "Admin Profile",
  "/admin/notifications": "Notifications",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

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
              {item.isLast ? (
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

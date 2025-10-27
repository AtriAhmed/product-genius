"use client";

import { usePathname } from "next/navigation";
import SubscriptionRequired from "./SubscriptionRequired";

type DashboardContentProps = {
  children: React.ReactNode;
  hasSubscription: boolean;
};

export default function DashboardContent({
  children,
  hasSubscription,
}: DashboardContentProps) {
  const pathname = usePathname();

  // If user has subscription, show children
  if (hasSubscription) {
    return <>{children}</>;
  }

  // If no subscription but on billing page, show children (billing page)
  if (pathname.includes("/billing")) {
    return <>{children}</>;
  }

  // If no subscription and not on billing page, show subscription required
  return <SubscriptionRequired />;
}

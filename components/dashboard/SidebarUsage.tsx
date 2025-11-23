"use client";

import { useAppProvider } from "@/contexts/AppProvider";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";

export default function SidebarUsage() {
  const { currentPlan, userSubscriptionInfo } = useAppProvider();
  const t = useTranslations("sidebar");

  console.log("-------------------- userSubscriptionInfo, currentPlan --------------------");
  console.log(userSubscriptionInfo, currentPlan);

  if (!currentPlan || !userSubscriptionInfo) {
    return <Skeleton className="w-full h-16" />;
  }

  const importedProductsPercentage =
    userSubscriptionInfo?.importedProductsLimit === Infinity
      ? 0
      : userSubscriptionInfo?.importedProductsLimit === 0
      ? 100
      : (userSubscriptionInfo?.importedProductsCount / userSubscriptionInfo?.importedProductsLimit) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <span className="font-medium text-sm">{t("imported products")}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>
            {userSubscriptionInfo?.importedProductsCount} /{" "}
            {userSubscriptionInfo?.importedProductsLimit === Infinity
              ? "∞"
              : userSubscriptionInfo?.importedProductsLimit}
          </span>
          {userSubscriptionInfo?.importedProductsLimit !== Infinity && (
            <span>{Math.round(importedProductsPercentage)}%</span>
          )}
        </div>
        <Progress
          value={importedProductsPercentage}
          className="h-2"
          indicatorClassName={
            importedProductsPercentage < 50
              ? "bg-green-600"
              : importedProductsPercentage < 80
              ? "bg-yellow-500"
              : "bg-red-500"
          }
        />
      </div>
    </div>
  );
}

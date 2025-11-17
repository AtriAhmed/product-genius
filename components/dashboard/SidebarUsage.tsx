"use client";

import { useAppProvider } from "@/contexts/AppProvider";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";

export default function SidebarUsage() {
  const { currentPlan, userUsage } = useAppProvider();
  const t = useTranslations("sidebar");

  console.log("-------------------- userUsage, currentPlan --------------------");
  console.log(userUsage, currentPlan);

  if (!currentPlan || !userUsage) {
    return <Skeleton className="w-full h-16" />;
  }

  const importedProductsFeature = currentPlan.features?.find((f) => f.key === "imported-products");
  const importedProductsLimit = importedProductsFeature?.value ? parseInt(importedProductsFeature.value, 10) : Infinity;
  const importedProductsCount = userUsage.importedProductsCount || 0;
  const importedProductsPercentage =
    importedProductsLimit === Infinity ? 0 : (importedProductsCount / importedProductsLimit) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <span className="font-medium text-sm">{t("imported products")}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>
            {importedProductsCount} / {importedProductsLimit === Infinity ? "∞" : importedProductsLimit}
          </span>
          {importedProductsLimit !== Infinity && <span>{Math.round(importedProductsPercentage)}%</span>}
        </div>
        <Progress value={importedProductsPercentage} className="h-2" />
      </div>
    </div>
  );
}

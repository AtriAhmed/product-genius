"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanInterval } from "@/types";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PlanFormData } from "./types";

type PlanPricingProps = {
  setValue: UseFormSetValue<PlanFormData>;
  watch: UseFormWatch<PlanFormData>;
  errors: FieldErrors<PlanFormData>;
};

export default function PlanPricing({
  setValue,
  watch,
  errors,
}: PlanPricingProps) {
  const t = useTranslations("plans");

  const prices = watch("prices") || [];

  const intervalOptions = [
    { value: "DAY" as const, label: t("daily") },
    { value: "WEEK" as const, label: t("weekly") },
    { value: "MONTH" as const, label: t("monthly") },
    { value: "YEAR" as const, label: t("yearly") },
  ];

  // Initialize prices if empty
  if (prices.length === 0) {
    const initialPrices = intervalOptions.map((interval) => ({
      interval: interval.value,
      price: undefined,
      compareAtPrice: undefined,
    }));
    setValue("prices", initialPrices, { shouldDirty: true });
  }

  const updatePrice = (
    interval: PlanInterval,
    field: "price" | "compareAtPrice",
    value: number | undefined
  ) => {
    const currentPrices = watch("prices") || [];
    const updatedPrices = currentPrices.map((p) =>
      p.interval === interval ? { ...p, [field]: value } : p
    );

    // If price doesn't exist for this interval, create it
    if (!updatedPrices.find((p) => p.interval === interval)) {
      updatedPrices.push({
        interval,
        price: field === "price" ? value : undefined,
        compareAtPrice: field === "compareAtPrice" ? value : undefined,
      });
    }

    setValue("prices", updatedPrices, { shouldDirty: true });
  };

  const getPriceForInterval = (interval: PlanInterval) => {
    return (
      prices.find((p) => p.interval === interval) || {
        interval,
        price: undefined,
        compareAtPrice: undefined,
      }
    );
  };

  console.log("-------------------- errors --------------------");
  console.log(errors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pricing")}</CardTitle>
        <p className="text-muted-foreground text-sm">
          {t("set prices for different billing intervals")}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="MONTH" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            {intervalOptions.map((interval) => (
              <TabsTrigger key={interval.value} value={interval.value}>
                {interval.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {intervalOptions.map((interval) => {
            const priceData = getPriceForInterval(interval.value);

            return (
              <TabsContent
                key={interval.value}
                value={interval.value}
                className="space-y-4"
              >
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`price-${interval.value}`}>
                      {t("price")} ({interval.label})
                    </Label>
                    <Input
                      id={`price-${interval.value}`}
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder={t("price placeholder")}
                      value={priceData.price ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value);
                        updatePrice(interval.value, "price", value);
                      }}
                      className={errors.prices ? "border-red-500" : ""}
                    />
                    {errors.prices && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.prices.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`compareAtPrice-${interval.value}`}>
                      {t("compare at price")} ({interval.label})
                    </Label>
                    <Input
                      id={`compareAtPrice-${interval.value}`}
                      type="number"
                      step="0.5"
                      placeholder={t("compare at price placeholder")}
                      value={priceData.compareAtPrice ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value);
                        updatePrice(interval.value, "compareAtPrice", value);
                      }}
                    />
                    <p className="mt-1 text-muted-foreground text-xs">
                      {t("optional original price for discount display")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

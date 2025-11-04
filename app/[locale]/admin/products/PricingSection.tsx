"use client";

import { ProductFormData } from "@/app/[locale]/admin/products/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/types/constants";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

// Helper function to get error message
const getErrorMessage = (error: any): string | undefined => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error)
    return error.message;
  return undefined;
};

interface PricingSectionProps {
  setValue: UseFormSetValue<any>;
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<any>;
  currency?: string;
}

export default function PricingSection({
  register,
  setValue,
  errors,
  currency = "EUR",
}: PricingSectionProps) {
  const t = useTranslations("products");

  const selectedCurrency = currency
    ? CURRENCIES.find((c) => c.code === currency)
    : null;

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t("pricing")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currency Selection */}
        <div className="space-y-2">
          <Label htmlFor="currency">{t("currency")}</Label>
          <Select
            value={currency}
            onValueChange={(value) => {
              setValue("currency", value, { shouldDirty: true });
            }}
          >
            <SelectTrigger>
              {selectedCurrency
                ? `${selectedCurrency.symbol} ${selectedCurrency.name} ${selectedCurrency.code}`
                : t("select currency")}
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-destructive text-sm">
              {getErrorMessage(errors.currency)}
            </p>
          )}
        </div>

        <div className="gap-x-2 gap-y-2 grid grid-cols-1 md:grid-cols-3">
          {/* Regular Price */}
          <div className="space-y-2">
            <Label htmlFor="price">{t("price")}</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.5"
                placeholder="0.00"
                {...register("price", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              <span className="top-1/2 right-3 absolute text-muted-foreground text-sm -translate-y-1/2 transform">
                {CURRENCIES.find((c) => c.code === currency)?.symbol}
              </span>
            </div>
            {errors.price && (
              <p className="text-destructive text-sm">
                {getErrorMessage(errors.price)}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t("regular selling price")}
            </p>
          </div>

          {/* Compare At Price */}
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">{t("compare at price")}</Label>
            <div className="relative">
              <Input
                id="compareAtPrice"
                type="text"
                step="0.5"
                placeholder="0.00"
                {...register("compareAtPrice", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              <span className="top-1/2 right-3 absolute text-muted-foreground text-sm -translate-y-1/2 transform">
                {CURRENCIES.find((c) => c.code === currency)?.symbol}
              </span>
            </div>
            {errors.compareAtPrice && (
              <p className="text-destructive text-sm">
                {getErrorMessage(errors.compareAtPrice)}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t("original price for discount display")}
            </p>
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">{t("suggested selling price")}</Label>
            <div className="relative">
              <Input
                id="sellingPrice"
                type="number"
                step="0.5"
                placeholder="0.00"
                {...register("sellingPrice", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              <span className="top-1/2 right-3 absolute text-muted-foreground text-sm -translate-y-1/2 transform">
                {CURRENCIES.find((c) => c.code === currency)?.symbol}
              </span>
            </div>
            {errors.sellingPrice && (
              <p className="text-destructive text-sm">
                {getErrorMessage(errors.sellingPrice)}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t("suggested price for customers")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

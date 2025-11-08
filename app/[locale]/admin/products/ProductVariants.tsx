"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Package2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useFormContext } from "react-hook-form";
import { ProductFormData, ProductVariantFormData } from "./types";
import { hueFromString } from "@/lib/utils";
import { useIsMounted } from "@/hooks/use-is-mounted";

type ProductVariantsPreviewProps = {};

export default function ProductVariants({}: ProductVariantsPreviewProps) {
  const t = useTranslations("products");
  const { watch, setValue } = useFormContext<ProductFormData>();
  const { theme } = useTheme();
  const isMounted = useIsMounted();

  const variants = watch("variants") || [];
  const options = watch("options") || [];

  function onVariantPriceChange(variantId: string | number, price: number | undefined) {
    const updatedVariants = variants.map((variant) => (variant.id === variantId ? { ...variant, price } : variant));
    setValue("variants", updatedVariants, { shouldDirty: true });
  }

  if (variants.length === 0) {
    return null;
  }

  // Helper to get option and value names for display
  const getVariantDisplayInfo = (variant: ProductVariantFormData) => {
    const variantInfo: string[] = [];

    Object.entries(variant.options).forEach(([optionId, valueId]) => {
      const option = options.find((opt) => opt.id == optionId);
      const value = option?.values.find((val) => val.id == valueId);

      if (option && value) {
        variantInfo.push(`${option.name}: ${value.value}`);
      }
    });

    return variantInfo;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="w-5 h-5" />
          {t("generated variants")} ({variants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {variants.map((variant, index) => {
            const displayInfo = getVariantDisplayInfo(variant);

            return (
              <div key={variant.id} className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/30">
                {/* Variant Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {t("variant")} #{index + 1}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      ID: {variant.id}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayInfo.map((info, infoIndex) => (
                      <Badge
                        key={infoIndex}
                        className="text-xs"
                        style={{
                          backgroundColor:
                            !isMounted || theme === "dark"
                              ? `hsl(${hueFromString(info.split(":")[0].trim())}, 40%, 25%)` // darker background for dark mode
                              : `hsl(${hueFromString(info.split(":")[0].trim())}, 65%, 85%)`, // softer pastel for light mode
                          color: !isMounted || theme === "dark" ? "white" : "black",
                        }}
                      >
                        {info}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Input */}
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div className="space-x-3 space-y-1">
                    <Label htmlFor={`variant-price-${variant.id}`} className="text-xs">
                      {t("price")}
                    </Label>
                    <Input
                      id={`variant-price-${variant.id}`}
                      type="number"
                      step="0.5"
                      value={variant.price ?? ""}
                      onChange={(e) => {
                        const price = e.target.value ? parseFloat(e.target.value) : undefined;
                        onVariantPriceChange(variant.id, price);
                      }}
                      className="w-24 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

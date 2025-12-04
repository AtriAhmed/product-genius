"use client";

import { useTranslations } from "next-intl";
import { Product, User } from "@/types";
import { formatCurrency, hueFromString } from "@/lib/utils";
import { formatPriceRange } from "@/lib/productVariants";
import { VariantsAccordion } from "@/app/[locale]/dashboard/products/[id]/VariantsAccordion";
import { ShippingZonesAccordion } from "@/app/[locale]/dashboard/products/[id]/ShippingZonesAccordion";

interface ProvidersPreviewProps {
  product: Product;
  user: User;
}

export function ProductPricing({ product, user }: ProvidersPreviewProps) {
  const t = useTranslations("products");
  const suppliers = product.suppliers || [];
  const variants = product.variants || [];
  const options = product.options || [];
  const shippingZones = product.productShippingZones || [];

  // If no variants, no suppliers, and no internal pricing, don't render
  if (!suppliers?.length && variants.length === 0) return null;

  const formattedPrice = formatPriceRange(product.minPrice, product.maxPrice);

  return (
    <div className="space-y-4 mt-4">
      {/* <h3 className="font-semibold text-lg">Available From</h3> */}

      {/* Our Store Section */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {options.length === 0 ? (
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-gray-50 dark:to-gray-900/50 shadow-sm">
                <div className="mb-0 font-medium text-slate-600 dark:text-slate-400 text-sm">PRICE</div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-3xl tracking-tight">
                      {formattedPrice}
                    </div>
                    {product?.variants?.[0]?.compareAtPrice && (
                      <div className="text-slate-500 dark:text-slate-400 text-lg line-through">
                        {formatCurrency(product?.variants?.[0]?.compareAtPrice)}
                      </div>
                    )}
                  </div>
                  {!!product?.variants?.[0]?.sellingPrice && (
                    <div className="pt-4 border-slate-200 dark:border-slate-700 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                            <div className="font-bold text-slate-500 text-xs">SUGGESTED SELLING PRICE</div>
                          </div>
                          <div className="font-semibold text-slate-500 dark:text-blue-100 text-lg">
                            {formatCurrency(product?.variants?.[0]?.sellingPrice, product.currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Enhanced Price Range for Multiple Options */}
                <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-gray-50 dark:to-gray-900/50 shadow-sm">
                  <div className="mb-2 font-medium text-slate-600 dark:text-slate-400 text-sm">PRICE RANGE</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-3xl tracking-tight">
                    {formattedPrice}
                  </div>
                </div>

                {/* Available Options */}
                <div className="space-y-3">
                  <div className="text-muted-foreground text-sm">Available Options:</div>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div key={option.id} className="space-y-1">
                        <div className="font-medium text-sm">{option.name}:</div>
                        <div className="flex flex-wrap gap-2">
                          {option.values?.map((value) => {
                            const hue = hueFromString(option.name || "");
                            return (
                              <div
                                key={value.id}
                                className="px-3 py-1 border rounded-md font-medium text-xs"
                                style={{
                                  backgroundColor: `hsl(${hue}, 65%, 90%)`,
                                  borderColor: `hsl(${hue}, 65%, 75%)`,
                                  color: `hsl(${hue}, 65%, 25%)`,
                                }}
                              >
                                {value.value}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variants Accordion */}
                <VariantsAccordion variants={variants} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipping Zones Section */}
      <ShippingZonesAccordion shippingZones={shippingZones} />
    </div>
  );
}

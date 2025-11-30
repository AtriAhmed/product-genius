"use client";

import { useTranslations } from "next-intl";
import { Product, User } from "@/types";
import { hueFromString } from "@/lib/utils";
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
              <div className="mb-8">
                <span className="text-muted-foreground text-sm">Price:</span>
                <div className="font-semibold text-2xl">{formattedPrice}</div>
              </div>
            ) : (
              // Multiple options case - show price range, options, and variants
              <div className="space-y-4">
                {/* Price Range */}
                <div className="font-semibold text-2xl">{formattedPrice}</div>

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

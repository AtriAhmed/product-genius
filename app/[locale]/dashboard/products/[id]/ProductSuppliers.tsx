"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MarketplaceCard from "@/app/[locale]/dashboard/products/[id]/MarketplaceCard";
import InternalSupplierCard from "@/app/[locale]/dashboard/products/[id]/InternalSupplierCard";
import { Product, User } from "@/types";
import { formatPrice, hueFromString } from "@/lib/utils";
import { getProductPrices } from "@/lib/productVariants";

interface ProvidersPreviewProps {
  product: Product;
  user: User;
}

export function ProductSuppliers({ product, user }: ProvidersPreviewProps) {
  const t = useTranslations("products");
  const suppliers = product.suppliers || [];
  const variants = product.variants || [];
  const options = product.options || [];
  const productId = product.id;
  const hasStore = !!user?.shopifyStores?.[0];
  const isImported = product?.productMappings?.length! > 0;

  // If no variants, no suppliers, and no internal pricing, don't render
  if (!suppliers?.length && variants.length === 0) return null;

  const { formattedPrice } = getProductPrices(variants || []);

  // Helper function to get option value names for a variant
  const getVariantOptionNames = (variant: any) => {
    return variant.options?.map((vo: any) => vo.value?.value).join(", ") || "";
  };

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
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="variants" className="overflow-hidden !border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 border-primary-500 bg-primary-500 hover:bg-primary-500/90 font-medium text-white text-sm transition-colors">
                      View all variants and prices ({variants.length})
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 bg-white dark:bg-gray-900">
                      <div className="space-y-2 mt-3">
                        {variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex justify-between items-center p-2 border rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {variant.options?.map((vo: any) => {
                                  console.log("-------------------- variant --------------------");
                                  console.log(variant);
                                  const optionName = vo.option?.name || "Option";
                                  const optionValue = vo.value?.value || "Value";
                                  const hue = hueFromString(optionName);

                                  return (
                                    <div
                                      key={`${vo.optionId}-${vo.valueId}`}
                                      className="px-2 py-1 border rounded-md font-medium text-xs"
                                      style={{
                                        backgroundColor: `hsl(${hue}, 70%, 95%)`,
                                        borderColor: `hsl(${hue}, 70%, 80%)`,
                                        color: `hsl(${hue}, 70%, 30%)`,
                                      }}
                                    >
                                      <span className="opacity-70">{optionName}:</span> {optionValue}
                                    </div>
                                  );
                                })}
                              </div>
                              {variant.sku && <div className="text-muted-foreground text-xs">SKU: {variant.sku}</div>}
                              {variant.trackInventory && (
                                <div className="text-muted-foreground text-xs">Stock: {variant.inventory || 0}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatPrice(variant.price!)}</div>
                              {variant.compareAtPrice && (
                                <div className="text-muted-foreground text-xs line-through">
                                  {formatPrice(variant.compareAtPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Import to Shopify Button */}
            <InternalSupplierCard
              hasStore={hasStore}
              productId={productId}
              compareAtPrice={
                variants.find((v) => v.compareAtPrice)?.compareAtPrice || variants[0]?.compareAtPrice || undefined
              }
              isImported={isImported}
              formattedPrice={formattedPrice || "N/A"}
            />
          </div>
        </div>
      )}

      {/* External Marketplaces */}
      {suppliers.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-sm">Marketplaces</h4>
          <div className="gap-2 grid xl:grid-cols-2">
            {suppliers.map((supplier) => (
              <MarketplaceCard key={supplier.id} supplier={supplier} compact={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

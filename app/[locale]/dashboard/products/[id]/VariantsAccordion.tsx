"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency, hueFromString } from "@/lib/utils";

type VariantsAccordionProps = {
  variants: any[];
};

export function VariantsAccordion({ variants }: VariantsAccordionProps) {
  const t = useTranslations("products");

  if (variants.length === 0) return null;

  return (
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
                  <div className="font-semibold">{formatCurrency(variant.price!)}</div>
                  {variant.compareAtPrice && (
                    <div className="text-muted-foreground text-xs line-through">
                      {formatCurrency(variant.compareAtPrice)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

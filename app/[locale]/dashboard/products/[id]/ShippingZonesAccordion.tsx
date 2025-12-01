"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { COUNTRIES } from "@/types/countries";

type ShippingZonesAccordionProps = {
  shippingZones: any[];
};

export function ShippingZonesAccordion({ shippingZones }: ShippingZonesAccordionProps) {
  const t = useTranslations("products");
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get country name from code
  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.alpha2 === code);
    return country?.name || code?.toUpperCase?.();
  };

  // Filter countries based on search term
  const filterCountries = (countries: any[]) => {
    if (!searchTerm.trim()) return countries;

    return countries.filter((country: any) => {
      const countryName = getCountryName(country.countryCode || "").toLowerCase();
      const countryCode = (country.countryCode || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      return countryName.includes(search) || countryCode.includes(search);
    });
  };

  if (shippingZones.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="shipping" className="overflow-hidden !border rounded-lg">
        <AccordionTrigger className="px-4 py-3 border-primary-500 bg-primary-500 hover:bg-primary-500/90 font-medium text-white text-sm transition-colors">
          View shipping zones and rates ({shippingZones.length})
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 bg-white dark:bg-gray-900">
          <div className="space-y-3 mt-3">
            {/* Search input */}
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
              <Input
                placeholder={t("search countries")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {shippingZones.map((productShippingZone) => {
              const zone = productShippingZone.zone;
              if (!zone) return null;

              const filteredCountries = filterCountries(zone.countries || []);

              // Don't show zones with no matching countries when searching
              if (searchTerm.trim() && filteredCountries.length === 0) return null;

              return (
                <Card
                  key={productShippingZone.id}
                  className="border-2 border-muted-foreground/25 border-dashed bg-background shadow-none"
                >
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">
                          {t("countries")}{" "}
                          {searchTerm.trim() && `(${filteredCountries.length}/${zone.countries?.length || 0})`}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {filteredCountries.map((country: any) => (
                            <Badge
                              key={country.id}
                              variant="outline"
                              className="py-1 pr-2 pl-1.5 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
                            >
                              <img
                                src={`https://flagsapi.com/${country.countryCode?.toUpperCase()}/flat/32.png`}
                                alt={country.countryCode || ""}
                                className="w-4 object-cover mr-1.5 rounded"
                              />
                              <span className="text-xs text-wrap">{getCountryName(country.countryCode || "")}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {productShippingZone.productShippingRules &&
                        productShippingZone.productShippingRules.length > 0 && (
                          <div>
                            <p className="mb-2 font-medium text-muted-foreground text-xs">{t("shipping rules")}:</p>
                            <div className="space-y-1.5">
                              {productShippingZone.productShippingRules.map((rule: any) => (
                                <div
                                  key={rule.id}
                                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm"
                                >
                                  <Badge variant="secondary" className="font-mono text-xs">
                                    {rule.minQuantity || 1} - {rule.maxQuantity || "∞"}
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(rule.price || 0)}
                                  </span>
                                  <span className="text-muted-foreground text-xs">{t("shipping")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

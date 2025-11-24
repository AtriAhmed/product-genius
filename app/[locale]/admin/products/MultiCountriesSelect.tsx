"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/types/countries";
import { useTranslations } from "next-intl";

interface MultiCountriesSelectProps {
  selectedCountries: string[];
  onSelectionChange: (countries: string[]) => void;
  className?: string;
}

export default function MultiCountriesSelect({
  selectedCountries,
  onSelectionChange,
  className,
}: MultiCountriesSelectProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("products");

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onSelectionChange(selectedCountries.filter((code) => code !== countryCode));
    } else {
      onSelectionChange([...selectedCountries, countryCode]);
    }
  };

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.alpha2 === code);
    return country?.name || code.toUpperCase();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", className)}
        >
          <span className="truncate">
            {selectedCountries.length === 0
              ? t("select countries")
              : `${selectedCountries.length} ${t("countries selected")}`}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("search countries")} className="no-ring" />
          <CommandList>
            <CommandEmpty>{t("no countries found")}</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => {
                const isSelected = selectedCountries.includes(country.alpha2);
                return (
                  <CommandItem
                    key={country.alpha2}
                    value={`${country.name} ${country.alpha2}`}
                    onSelect={() => toggleCountry(country.alpha2)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <img
                        src={`https://flagsapi.com/${country.alpha2.toUpperCase()}/flat/24.png`}
                        alt={`${country.name} flag`}
                        className="w-4 h-3 object-cover rounded-sm"
                      />
                      <span>{country.name}</span>
                    </div>
                    <Check className={cn("w-4 h-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {selectedCountries.length > 0 && (
            <div className="flex justify-between items-center p-3 border-t bg-muted/50">
              <span className="text-muted-foreground text-sm">
                {selectedCountries.length} {t("selected")}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onSelectionChange([])}>
                {t("clear all")}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

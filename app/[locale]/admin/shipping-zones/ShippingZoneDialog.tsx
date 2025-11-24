"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShippingZone } from "@/types";
import MultiCountriesSelect from "@/app/[locale]/admin/products/MultiCountriesSelect";
import { COUNTRIES } from "@/types/countries";

interface ShippingZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: ShippingZone;
  onSave: (zone: { name: string; countries: string[] }) => void;
  isSaving?: boolean;
}

export default function ShippingZoneDialog({
  open,
  onOpenChange,
  zone,
  onSave,
  isSaving = false,
}: ShippingZoneDialogProps) {
  const t = useTranslations("shipping-zones");
  const [name, setName] = useState("");
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setCountries(zone.countries?.map((c) => c.countryCode)?.filter((code) => code !== undefined) || []);
    } else {
      setName("");
      setCountries([]);
    }
  }, [zone, open]);

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.alpha2 === code);
    return country?.name || code?.toUpperCase?.();
  };

  const handleRemoveCountry = (countryCode: string) => {
    setCountries(countries.filter((code) => code !== countryCode));
  };

  const handleSave = () => {
    if (!name.trim() || countries.length === 0) {
      return;
    }
    onSave({ name: name.trim(), countries });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{zone ? t("edit zone") : t("add zone")}</DialogTitle>
          <DialogDescription>{t("define zone name and countries")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zone-name">{t("zone name")}</Label>
            <Input
              id="zone-name"
              placeholder={t("e;g;, North America, Europe")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("countries")}</Label>
            <MultiCountriesSelect selectedCountries={countries} onSelectionChange={setCountries} />
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {countries.map((code) => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="flex items-center py-1 pr-1 pl-2 border-blue-200 dark:border-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <img
                      src={`https://flagsapi.com/${code.toUpperCase()}/flat/24.png`}
                      alt={code}
                      className="w-4.5 object-cover mr-1.5 rounded"
                    />
                    <span className="text-xs">{getCountryName(code)}</span>
                    <button
                      onClick={() => handleRemoveCountry(code)}
                      className="ml-1.5 p-0.5 rounded-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim() || countries.length === 0 || isSaving}>
            {isSaving ? t("saving") : zone ? t("update zone") : t("add zone")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

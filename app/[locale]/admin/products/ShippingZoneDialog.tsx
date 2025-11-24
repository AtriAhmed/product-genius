"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { ShippingZoneFormData, ShippingRuleFormData } from "./types";
import ShippingZoneSelect from "./ShippingZoneSelect";
import { COUNTRIES } from "@/types/countries";

interface ShippingZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: ShippingZoneFormData;
  onSave: (zone: ShippingZoneFormData) => void;
  isEditing: boolean;
  excludeZoneIds?: number[];
}

export default function ShippingZoneDialog({
  open,
  onOpenChange,
  zone,
  onSave,
  isEditing,
  excludeZoneIds = [],
}: ShippingZoneDialogProps) {
  const t = useTranslations("products");
  const [currentZone, setCurrentZone] = useState<ShippingZoneFormData>(zone);
  const [selectedZoneName, setSelectedZoneName] = useState<string>("");
  const [selectedZoneCountries, setSelectedZoneCountries] = useState<string[]>([]);

  // Update internal state when zone prop changes
  useEffect(() => {
    setCurrentZone(zone);
  }, [zone]);

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.alpha2 === code);
    return country?.name || code?.toUpperCase?.();
  };

  const handleZoneSelect = (zoneId: number, zoneData: any) => {
    setCurrentZone({
      ...currentZone,
      zoneId,
    });
    setSelectedZoneName(zoneData.name || "");
    setSelectedZoneCountries(zoneData.countries.map((c: any) => c.countryCode));
  };

  const handleAddRule = () => {
    const lastRule = currentZone.rules[currentZone.rules.length - 1];
    const newMinQuantity = lastRule?.minQuantity ? lastRule.minQuantity + 1 : 1;

    const updatedRules = currentZone.rules.map((rule, i) => {
      if (i === currentZone.rules.length - 1) {
        return {
          ...rule,
          maxQuantity: newMinQuantity - 1,
        };
      }
      return rule;
    });

    setCurrentZone({
      ...currentZone,
      rules: [
        ...updatedRules,
        {
          price: 0,
          minQuantity: newMinQuantity,
          maxQuantity: null,
        },
      ],
    });
  };

  const handleRemoveRule = (index: number) => {
    if (currentZone.rules.length === 1) return;

    const newRules = currentZone.rules.filter((_, i) => i !== index);

    const updatedRules = newRules.map((rule, i) => {
      if (i === newRules.length - 1) {
        return { ...rule, maxQuantity: null };
      }
      const nextMin = newRules[i + 1]?.minQuantity;
      return { ...rule, maxQuantity: nextMin ? nextMin - 1 : null };
    });

    setCurrentZone({
      ...currentZone,
      rules: updatedRules,
    });
  };

  const handleUpdateRule = (index: number, field: keyof ShippingRuleFormData, value: any) => {
    const newRules = [...currentZone.rules];
    newRules[index] = {
      ...newRules[index],
      [field]: value,
    };

    if (field === "minQuantity") {
      const updatedRules = newRules.map((rule, i) => {
        if (i === newRules.length - 1) {
          return { ...rule, maxQuantity: null };
        }
        const nextMin = newRules[i + 1]?.minQuantity;
        return { ...rule, maxQuantity: nextMin ? nextMin - 1 : null };
      });

      setCurrentZone({
        ...currentZone,
        rules: updatedRules,
      });
    } else {
      setCurrentZone({
        ...currentZone,
        rules: newRules,
      });
    }
  };

  const handleSave = () => {
    if (!currentZone.zoneId || currentZone.rules.length === 0) {
      return;
    }
    onSave(currentZone);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("edit shipping zone") : t("add shipping zone")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("shipping zone")}</Label>
            <ShippingZoneSelect
              value={currentZone.zoneId}
              onChange={handleZoneSelect}
              excludeZoneIds={excludeZoneIds}
            />
            {selectedZoneCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedZoneCountries.map((code) => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="flex items-center py-1 pr-2 pl-1.5 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
                  >
                    <img
                      src={`https://flagsapi.com/${code.toUpperCase()}/flat/24.png`}
                      alt={code}
                      className="w-4.5 object-cover mr-1.5 rounded"
                    />
                    <span className="text-xs">{getCountryName(code)}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{t("shipping rules")}</Label>
              <Button variant="outline" size="sm" onClick={handleAddRule}>
                <Plus className="w-3 h-3 mr-1" />
                {t("add range")}
              </Button>
            </div>

            <div className="space-y-4">
              {currentZone.rules.map((rule, index) => (
                <div key={index}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 gap-2 grid grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("min quantity")}</Label>
                        <Input
                          type="number"
                          min={index === 0 ? 1 : (currentZone.rules[index - 1]?.minQuantity || 0) + 1}
                          value={rule.minQuantity || ""}
                          onChange={(e) => handleUpdateRule(index, "minQuantity", parseInt(e.target.value) || null)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("max quantity")}</Label>
                        <Input type="number" value={rule.maxQuantity || ""} disabled placeholder={t("unlimited")} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("shipping price")} (¢)</Label>
                        <Input
                          type="number"
                          value={rule.price}
                          onChange={(e) => handleUpdateRule(index, "price", parseInt(e.target.value) || "")}
                        />
                      </div>
                    </div>
                    {currentZone.rules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-5 shrink-0"
                        onClick={() => handleRemoveRule(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? t("update zone") : t("add zone")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

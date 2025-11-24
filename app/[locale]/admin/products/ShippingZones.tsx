"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrencyCents } from "@/lib/utils";
import { ProductFormData, ShippingZoneFormData } from "./types";
import ShippingZoneDialog from "@/app/[locale]/admin/products/ShippingZoneDialog";
import { COUNTRIES } from "@/types/countries";

export default function ShippingZones() {
  const t = useTranslations("products");
  const {
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<ProductFormData>();

  const shippingZones = watch("shippingZones") || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [currentZone, setCurrentZone] = useState<ShippingZoneFormData>({
    name: "",
    countries: [],
    rules: [{ priceCents: 0, minQuantity: 1, maxQuantity: null }],
  });

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.alpha2 === code);
    return country?.name || code?.toUpperCase?.();
  };

  const handleOpenDialog = (zoneIndex?: number) => {
    if (zoneIndex !== undefined) {
      setEditingZoneIndex(zoneIndex);
      setCurrentZone({ ...shippingZones[zoneIndex] });
    } else {
      setEditingZoneIndex(null);
      setCurrentZone({
        name: "",
        countries: [],
        rules: [{ priceCents: 0, minQuantity: 1, maxQuantity: null }],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingZoneIndex(null);
  };

  const handleSaveZone = (zone: ShippingZoneFormData) => {
    const newZones = [...shippingZones];
    if (editingZoneIndex !== null) {
      newZones[editingZoneIndex] = zone;
    } else {
      newZones.push({
        ...zone,
        id: `temp-${Date.now()}`,
      });
    }

    setValue("shippingZones", newZones, { shouldDirty: true });
    handleCloseDialog();
  };

  const handleDeleteZone = (index: number) => {
    const newZones = shippingZones.filter((_, i) => i !== index);
    setValue("shippingZones", newZones, { shouldDirty: true });
  };

  const hasErrors = !!errors?.shippingZones;

  return (
    <Card className={cn("bg-background", hasErrors && "border-red-200 dark:border-red-800")}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("shipping zones")}</CardTitle>
          </div>
          <Button variant="primary" size="sm" onClick={() => handleOpenDialog()} type="button">
            <Plus className="w-4 h-4 mr-2" />
            {t("add zone")}
          </Button>
        </div>
      </CardHeader>

      <ShippingZoneDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        zone={currentZone}
        onSave={handleSaveZone}
        isEditing={editingZoneIndex !== null}
      />

      <CardContent>
        {shippingZones.length === 0 ? (
          <div className="py-6 text-muted-foreground text-center">{t("no shipping zones configured")}</div>
        ) : (
          <div className="space-y-3">
            {shippingZones.map((zone, index) => (
              <Card key={index} className="border-2">
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      {zone.name && <h4 className="font-semibold text-base">{zone.name}</h4>}

                      <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">{t("countries")}:</p>
                        <div className="flex flex-wrap gap-2">
                          {zone.countries.map((code) => (
                            <Badge
                              key={code}
                              variant="outline"
                              className="py-1 pr-2 pl-1.5 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
                            >
                              <img
                                src={`https://flagsapi.com/${code.toUpperCase()}/flat/32.png`}
                                alt={code}
                                className="w-4 h-3 object-cover mr-1.5 rounded-sm"
                              />
                              <span className="text-xs">{getCountryName(code)}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">{t("shipping rules")}:</p>
                        <div className="space-y-1.5">
                          {zone.rules.map((rule, ruleIndex) => (
                            <div
                              key={ruleIndex}
                              className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm"
                            >
                              <Badge variant="secondary" className="font-mono text-xs">
                                {rule.minQuantity || 1} - {rule.maxQuantity || "∞"}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrencyCents(rule.priceCents)}
                              </span>
                              <span className="text-muted-foreground text-xs">{t("shipping")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(index)} type="button">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(index)} type="button">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

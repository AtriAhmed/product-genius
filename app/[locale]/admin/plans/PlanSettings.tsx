"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { UseFormRegister, Control, Controller } from "react-hook-form";
import { PlanFormData } from "./types";

type PlanSettingsProps = {
  register: UseFormRegister<PlanFormData>;
  control: Control<PlanFormData>;
};

export default function PlanSettings({ register, control }: PlanSettingsProps) {
  const t = useTranslations("plans");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>{t("plan is active")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("active plans are available")}
            </p>
          </div>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>{t("most popular")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("mark as most popular")}
            </p>
          </div>
          <Controller
            name="mostPopular"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div>
          <Label htmlFor="sortOrder">{t("sort order")}</Label>
          <Input
            id="sortOrder"
            type="number"
            min="0"
            placeholder="0"
            {...register("sortOrder", { valueAsNumber: true })}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {t("display order")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

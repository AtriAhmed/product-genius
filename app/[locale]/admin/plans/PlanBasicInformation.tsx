"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { PlanFormData } from "./types";

type PlanBasicInformationProps = {
  register: UseFormRegister<PlanFormData>;
  errors: FieldErrors<PlanFormData>;
  setValue: UseFormSetValue<PlanFormData>;
  watch: UseFormWatch<PlanFormData>;
};

export default function PlanBasicInformation({
  register,
  errors,
  setValue,
  watch,
}: PlanBasicInformationProps) {
  const t = useTranslations("plans");

  const active = watch("active");
  const mostPopular = watch("mostPopular");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("basic information")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">{t("plan name")}</Label>
          <Input
            id="name"
            placeholder={t("plan name placeholder")}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-destructive text-sm">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">{t("plan description")}</Label>
          <Textarea
            id="description"
            placeholder={t("plan description placeholder")}
            {...register("description")}
          />
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Label>{t("plan is active")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("active plans are available")}
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={(checked) =>
                setValue("active", checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <Label>{t("most popular")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("mark as most popular")}
              </p>
            </div>
            <Switch
              checked={mostPopular}
              onCheckedChange={(checked) =>
                setValue("mostPopular", checked, { shouldDirty: true })
              }
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
            <p className="mt-1 text-muted-foreground text-sm">
              {t("display order")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

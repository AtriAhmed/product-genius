"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";
import { PlanFormData } from "./types";

type PlanBasicInformationProps = {
  register: UseFormRegister<PlanFormData>;
  control: Control<PlanFormData>;
  errors: FieldErrors<PlanFormData>;
};

export default function PlanBasicInformation({
  register,
  control,
  errors,
}: PlanBasicInformationProps) {
  const t = useTranslations("plans");

  const intervalOptions = [
    { value: "DAY", label: t("daily") },
    { value: "WEEK", label: t("weekly") },
    { value: "MONTH", label: t("monthly") },
    { value: "YEAR", label: t("yearly") },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("basic information")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">{t("plan name")}</Label>
          <Input
            id="name"
            placeholder={t("plan name placeholder")}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">{t("plan description")}</Label>
          <Textarea
            id="description"
            placeholder={t("plan description placeholder")}
            {...register("description")}
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">{t("price")}</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder={t("price placeholder")}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <Label>{t("interval")}</Label>
            <Controller
              name="interval"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intervalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
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
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
        </div>
      </CardContent>
    </Card>
  );
}

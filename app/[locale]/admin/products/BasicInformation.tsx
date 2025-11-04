"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getCurrentTranslation } from "@/lib/products";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormSetValue } from "react-hook-form";

interface Category {
  id: number;
  translations: {
    id: number;
    locale: string;
    title: string;
    description?: string;
  }[];
  _count: {
    products: number;
  };
}

interface BasicInformationProps {
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  categories: Category[];
  categoryValue?: number | null;
  isActive?: boolean;
}

export default function BasicInformation({
  setValue,
  errors,
  categories,
  categoryValue,
  isActive = true,
}: BasicInformationProps) {
  const t = useTranslations("products");

  const selectedCategory = categoryValue
    ? categories.find((cat) => cat.id === categoryValue)
    : null;

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {t("basic information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="font-medium text-sm">{t("category")}</label>
          <Select
            value={categoryValue?.toString() || ""}
            onValueChange={(value) => {
              setValue(
                "categoryId",
                value === "unclassified" ? undefined : parseInt(value),
                {
                  shouldDirty: true,
                }
              );
            }}
          >
            <SelectTrigger className="w-full">
              {selectedCategory
                ? getCurrentTranslation(selectedCategory?.translations)?.title
                : t("select category")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unclassified">{t("unclassified")}</SelectItem>
              {categories?.length ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {getCurrentTranslation(category?.translations)?.title} (
                    {category._count.products} products)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none">
                  {t("no categories available")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <label className="font-medium text-sm">{t("active status")}</label>
            <p className="text-muted-foreground text-sm">
              {t("control product visibility")}
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => {
              setValue("isActive", checked, {
                shouldDirty: true,
              });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

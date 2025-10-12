"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Package } from "lucide-react";
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
  categoryValue?: number;
}

export default function BasicInformation({
  setValue,
  errors,
  categories,
  categoryValue,
}: BasicInformationProps) {
  // Get category title in the first available language (preferably English)
  const getCategoryTitle = (category: Category) => {
    const enTranslation = category.translations.find((t) => t.locale === "en");
    if (enTranslation) return enTranslation.title;

    // Fallback to first available translation
    return category.translations[0]?.title || `Category ${category.id}`;
  };

  const selectedCategory = categoryValue
    ? categories.find((cat) => cat.id === categoryValue)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={categoryValue?.toString() || ""}
            onValueChange={(value) => {
              setValue("categoryId", value ? parseInt(value) : undefined, {
                shouldDirty: true,
              });
            }}
          >
            <SelectTrigger className="w-full">
              {selectedCategory
                ? getCategoryTitle(selectedCategory)
                : "Select a category"}
            </SelectTrigger>
            <SelectContent>
              {categories?.length ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {getCategoryTitle(category)} ({category._count.products}{" "}
                    products)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none">No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

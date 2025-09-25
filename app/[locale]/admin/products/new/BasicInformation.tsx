"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import { Controller } from "react-hook-form";

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

interface ProductFormData {
  categoryId?: number;
}

interface BasicInformationProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  categories: Category[];
}

export default function BasicInformation({
  register,
  control,
  errors,
  categories,
}: BasicInformationProps) {
  // Get category title in the first available language (preferably English)
  const getCategoryTitle = (category: Category) => {
    const enTranslation = category.translations.find((t) => t.locale === "en");
    if (enTranslation) return enTranslation.title;

    // Fallback to first available translation
    return category.translations[0]?.title || `Category ${category.id}`;
  };

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
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => {
                  field.onChange(value ? parseInt(value) : undefined);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {getCategoryTitle(category)} ({category._count.products}{" "}
                      products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Select the category this product belongs to (optional)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

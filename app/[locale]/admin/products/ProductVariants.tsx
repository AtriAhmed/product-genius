"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductFormData, ProductOptionFormData } from "./types";
import ProductOptionItem from "./ProductOptionItem";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

type ProductVariantsProps = {
  value: ProductOptionFormData[];
  onChange: (options: ProductOptionFormData[]) => void;
  maxOptions?: number;
  maxValuesPerOption?: number;
};

export default function ProductVariants({
  value = [],
  onChange,
  maxOptions = 3,
  maxValuesPerOption = 50,
}: ProductVariantsProps) {
  const t = useTranslations("products");
  const {
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const addOption = () => {
    if (value.length >= maxOptions) return;

    const newOption: ProductOptionFormData = {
      name: "",
      values: [],
    };
    onChange([...value, newOption]);
  };

  const removeOption = (index: number) => {
    const newOptions = value.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...value];
    newOptions[index].name = name;
    onChange(newOptions);
  };

  const addValue = (optionIndex: number, newValue: string) => {
    const newOptions = [...value];
    newOptions[optionIndex].values = [...newOptions[optionIndex].values, newValue];
    onChange(newOptions);
  };

  const updateValue = (optionIndex: number, valueIndex: number, newValue: string) => {
    const newOptions = [...value];
    newOptions[optionIndex].values[valueIndex] = newValue;
    onChange(newOptions);
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...value];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_: string, i: number) => i !== valueIndex);
    onChange(newOptions);
  };

  const reorderValues = (optionIndex: number, newValues: string[]) => {
    const newOptions = [...value];
    newOptions[optionIndex].values = newValues;
    onChange(newOptions);
  };

  const hasErrors = !!errors?.productOptions;

  return (
    <Card className={cn("bg-background", hasErrors && "border-red-200 dark:border-red-800")}>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary/10">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{t("product variants")}</h3>
              </div>
            </div>
            {value.length < maxOptions && (
              <Button type="button" onClick={addOption} className="gap-2 ms-auto shadow-sm" size="sm" variant="primary">
                <Plus className="w-4 h-4" />
                {t("add option")}
              </Button>
            )}
          </div>

          {/* Empty State */}
          {value.length === 0 && (
            <div className="p-6 border-2 border-muted-foreground/25 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex justify-center items-center w-12 h-12 mx-auto rounded-full bg-muted">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1 mb-3">
                  <h3 className="font-medium text-sm">{t("no options configured")}</h3>
                  <p className="max-w-md mx-auto text-muted-foreground text-xs">{t("add your first option")}</p>
                </div>
                <div className="pt-2 border-t border-dashed">
                  <p className="mb-1 font-medium text-muted-foreground text-xs">{t("examples")}:</p>
                  <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                    <Badge
                      variant="outline"
                      className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    >
                      {t("color red blue green")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    >
                      {t("size s m l xl")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                    >
                      {t("material cotton polyester")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Options List */}
          {value.length > 0 && (
            <div className="space-y-3">
              {value.map((option, optionIndex) => (
                <ProductOptionItem
                  key={optionIndex}
                  option={option}
                  optionIndex={optionIndex}
                  onUpdateName={updateOptionName}
                  onRemoveOption={removeOption}
                  onAddValue={addValue}
                  onUpdateValue={updateValue}
                  onRemoveValue={removeValue}
                  onReorderValues={reorderValues}
                  maxValuesPerOption={maxValuesPerOption}
                />
              ))}

              {/* Max Options Warning */}
              {value.length >= maxOptions && (
                <div className="flex items-center gap-2 p-2.5 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs">{t("maximum 3 options allowed")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

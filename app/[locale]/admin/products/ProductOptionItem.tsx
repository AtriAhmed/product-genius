"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProductOptionFormData } from "./types";

type ProductOptionItemProps = {
  option: ProductOptionFormData;
  optionIndex: number;
  onUpdateName: (index: number, name: string) => void;
  onRemoveOption: (index: number) => void;
  onAddValue: (optionIndex: number, value: string) => void;
  onRemoveValue: (optionIndex: number, valueIndex: number) => void;
  maxValuesPerOption: number;
};

export default function ProductOptionItem({
  option,
  optionIndex,
  onUpdateName,
  onRemoveOption,
  onAddValue,
  onRemoveValue,
  maxValuesPerOption,
}: ProductOptionItemProps) {
  const t = useTranslations("products");
  const [newValue, setNewValue] = useState("");

  const handleAddValue = () => {
    const trimmedValue = newValue.trim();
    if (!trimmedValue) return;

    if (option.values.includes(trimmedValue)) {
      return; // Duplicate value
    }

    if (option.values.length >= maxValuesPerOption) return;

    onAddValue(optionIndex, trimmedValue);
    setNewValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    } else if (e.key === "Escape") {
      setNewValue("");
    }
  };

  const handleValueKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    valueIndex: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemoveValue(optionIndex, valueIndex);
    }
  };

  return (
    <div className="relative flex gap-3 p-2 border-2 border-border/80 dark:border-border/70 border-dashed rounded-lg bg-card transition-shadow">
      {/* Index */}
      <div className="flex flex-shrink-0 items-center">
        <div className="flex justify-center items-center w-6 h-6 rounded-md bg-primary/10 font-medium text-primary text-xs">
          {optionIndex + 1}
        </div>
      </div>

      {/* Main content */}
      <div className="grow max-w-2xl">
        {/* Remove option button (top-right) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemoveOption(optionIndex)}
          aria-label={t("remove option")}
          className="top-2 right-2 absolute p-1 hover:bg-red-100 text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex sm:flex-row flex-col sm:items-start sm:gap-4">
          <div className="flex-1">
            <Label
              htmlFor={`option-name-${optionIndex}`}
              className="block font-medium text-xs"
            >
              {t("option name")}
            </Label>
            <Input
              id={`option-name-${optionIndex}`}
              value={option.name}
              onChange={(e) => onUpdateName(optionIndex, e.target.value)}
              placeholder={t("enter option name")}
              className="w-full mt-1 py-1 focus:ring-1 focus:ring-primary/30 text-xs"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-2 mt-3">
          <Label className="font-medium text-xs">{t("option values")}</Label>

          {/* Add Value Input */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t("enter value")}
              className="flex-1 min-w-[140px] py-1 text-xs"
              disabled={option.values.length >= maxValuesPerOption}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddValue}
              disabled={
                !newValue.trim() ||
                option.values.length >= maxValuesPerOption ||
                option.values.includes(newValue.trim())
              }
              className="p-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Existing Values */}
          {option.values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value: string, valueIndex: number) => (
                <button
                  key={valueIndex}
                  type="button"
                  onClick={() => onRemoveValue(optionIndex, valueIndex)}
                  onKeyDown={(e) => handleValueKeyDown(e, valueIndex)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-blue-200 hover:border-red-200 dark:border-blue-800 dark:hover:border-red-800 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/30 bg-blue-50 hover:bg-red-50 dark:bg-blue-950 dark:hover:bg-red-950 text-blue-700 hover:text-red-700 dark:hover:text-red-300 dark:text-blue-300 text-xs transition-transform hover:-translate-y-0.5 transform"
                >
                  <span className="text-xs">{value}</span>
                  <X className="w-3 h-3 ml-0.5" />
                </button>
              ))}
            </div>
          )}

          {/* Validation Messages */}
          {(option.values.length >= maxValuesPerOption ||
            (newValue && option.values.includes(newValue.trim())) ||
            option.values.length === 0) && (
            <div className="space-y-1">
              {option.values.length >= maxValuesPerOption && (
                <p className="flex items-center gap-1 text-amber-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {t("maximum 50 values allowed")}
                </p>
              )}
              {newValue && option.values.includes(newValue.trim()) && (
                <p className="flex items-center gap-1 text-destructive text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {t("duplicate values not allowed")}
                </p>
              )}
              {option.values.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  {t("at least one value required")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

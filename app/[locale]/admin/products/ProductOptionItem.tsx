"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, Plus, X } from "lucide-react";
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
  onReorderValues: (optionIndex: number, newValues: string[]) => void;
  maxValuesPerOption: number;
  fieldError?: any; // Validation errors for this specific option
};

// Sortable Value Item Component
interface SortableValueItemProps {
  value: string;
  valueId: string;
  optionIndex: number;
  valueIndex: number;
  onRemoveValue: (optionIndex: number, valueIndex: number) => void;
  t: (key: string) => string;
}

function SortableValueItem({
  value,
  valueId,
  optionIndex,
  valueIndex,
  onRemoveValue,
  t,
}: SortableValueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: valueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleValueKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemoveValue(optionIndex, valueIndex);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group inline-flex items-center gap-1 px-2 py-0.5 border border-blue-200 hover:border-red-200 dark:border-blue-800 dark:hover:border-red-800 rounded-full bg-blue-50 hover:bg-red-50 dark:bg-blue-950 dark:hover:bg-red-950 text-blue-700 hover:text-red-700 dark:hover:text-red-300 dark:text-blue-300 text-xs transition-transform hover:-translate-y-0.5 transform",
        isDragging && "opacity-50 z-10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <span className="text-xs">{value}</span>
      <button
        type="button"
        onClick={() => onRemoveValue(optionIndex, valueIndex)}
        onKeyDown={handleValueKeyDown}
        className="ml-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function ProductOptionItem({
  option,
  optionIndex,
  onUpdateName,
  onRemoveOption,
  onAddValue,
  onRemoveValue,
  onReorderValues,
  maxValuesPerOption,
  fieldError,
}: ProductOptionItemProps) {
  const t = useTranslations("products");
  const [newValue, setNewValue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = option.values.findIndex((value) => value === active.id);
      const newIndex = option.values.findIndex((value) => value === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newValues = arrayMove(option.values, oldIndex, newIndex);
        onReorderValues(optionIndex, newValues);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
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
              className={cn(
                "w-full mt-1 py-1 focus:ring-1 focus:ring-primary/30 text-xs",
                fieldError?.name &&
                  "border-red-500 focus:border-red-500 focus:ring-red-200"
              )}
            />
            {fieldError?.name?.message && (
              <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
                {fieldError.name.message}
              </p>
            )}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={option.values}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value: string, valueIndex: number) => (
                    <SortableValueItem
                      key={value}
                      value={value}
                      valueId={value}
                      optionIndex={optionIndex}
                      valueIndex={valueIndex}
                      onRemoveValue={onRemoveValue}
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-blue-200 dark:border-blue-800 rounded-full bg-blue-50 dark:bg-blue-950 shadow-lg text-blue-700 dark:text-blue-300 text-xs">
                    <GripVertical className="w-3 h-3" />
                    <span className="text-xs">{activeId}</span>
                    <X className="w-3 h-3 ml-0.5" />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {option.values.length > 1 && (
            <div className="text-muted-foreground text-xs">
              <strong>Drag</strong> the grip icon to reorder values
            </div>
          )}

          {/* Validation Messages */}
          {(option.values.length >= maxValuesPerOption ||
            (newValue && option.values.includes(newValue.trim())) ||
            option.values.length === 0 ||
            fieldError?.values) && (
            <div className="space-y-1">
              {/* Form validation error for values */}
              {fieldError?.values?.message && (
                <p className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {fieldError.values.message}
                </p>
              )}

              {/* Runtime validation messages */}
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
              {option.values.length === 0 && !fieldError?.values?.message && (
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

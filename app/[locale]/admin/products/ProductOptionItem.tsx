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
import { ProductFormData, ProductOptionFormData } from "./types";
import { useFormContext } from "react-hook-form";

type ProductOptionItemProps = {
  option: ProductOptionFormData;
  optionIndex: number;
  onUpdateName: (index: number, name: string) => void;
  onRemoveOption: (index: number) => void;
  onAddValue: (optionIndex: number, value: string) => void;
  onUpdateValue: (optionIndex: number, valueIndex: number, newValue: string) => void;
  onRemoveValue: (optionIndex: number, valueIndex: number) => void;
  onReorderValues: (optionIndex: number, sourceIndex: number, destinationIndex: number) => void;
  maxValuesPerOption: number;
};

// Sortable Value Item Component
interface SortableValueItemProps {
  valueObj: { id: string | number; value: string; position: number };
  optionIndex: number;
  valueIndex: number;
  onUpdateValue: (optionIndex: number, valueIndex: number, newValue: string) => void;
  onRemoveValue: (optionIndex: number, valueIndex: number) => void;
}

function SortableValueItem({
  valueObj,
  optionIndex,
  valueIndex,
  onUpdateValue,
  onRemoveValue,
}: SortableValueItemProps) {
  const t = useTranslations("products");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: valueObj.id });
  const {
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateValue(optionIndex, valueIndex, e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center gap-2 bg-card transition-all", isDragging && "opacity-50 z-10")}
    >
      <div {...attributes} {...listeners} className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Input
        value={valueObj.value}
        onChange={handleValueChange}
        placeholder={t("enter value")}
        className="flex-1 py-1 text-xs"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemoveValue(optionIndex, valueIndex)}
        className="p-1 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function ProductOptionItem({
  option,
  optionIndex,
  onUpdateName,
  onRemoveOption,
  onAddValue,
  onUpdateValue,
  onRemoveValue,
  onReorderValues,
  maxValuesPerOption,
}: ProductOptionItemProps) {
  const t = useTranslations("products");
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    formState: { errors },
  } = useFormContext<ProductFormData>();

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = option.values.findIndex((value) => value.id === active.id);
      const newIndex = option.values.findIndex((value) => value.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderValues(optionIndex, oldIndex, newIndex);
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
            <Label htmlFor={`option-name-${optionIndex}`} className="block font-medium text-xs">
              {t("option name")}
            </Label>
            <Input
              id={`option-name-${optionIndex}`}
              value={option.name}
              onChange={(e) => onUpdateName(optionIndex, e.target.value)}
              placeholder={t("enter option name")}
              className={cn("w-full mt-1 py-1 focus:ring-1 focus:ring-primary/30 text-xs")}
            />
            {errors?.options?.[optionIndex]?.name?.message && (
              <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
                {errors?.options?.[optionIndex]?.name?.message}
              </p>
            )}
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2">
            <Label className="font-medium text-xs">{t("option values")}</Label>

            {/* Add Value Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddValue(optionIndex, "")}
              disabled={option.values.length >= maxValuesPerOption}
              className="gap-2 text-xs"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              {t("add value")}
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
              <SortableContext items={option.values.map((v) => v.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {option.values.map((valueObj, valueIndex: number) => (
                    <SortableValueItem
                      key={valueObj.id}
                      valueObj={valueObj}
                      optionIndex={optionIndex}
                      valueIndex={valueIndex}
                      onUpdateValue={onUpdateValue}
                      onRemoveValue={onRemoveValue}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="flex items-center gap-2 bg-card">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={option.values.find((v) => v.id === activeId)?.value || ""}
                      readOnly
                      className="flex-1 py-1 text-xs"
                    />
                    <Button variant="ghost" size="sm" className="p-1" disabled>
                      <X className="w-4 h-4" />
                    </Button>
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
        </div>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useForm, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { PlanFormData } from "./types";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

// Schema for the add feature form
const addFeatureSchema = z.object({
  key: z.string().min(1, "Feature key is required"),
  value: z.string().optional(),
  description: z.string().min(1, "Feature description is required"),
  included: z.boolean(),
  note: z.string().optional(),
});

type AddFeatureFormData = z.infer<typeof addFeatureSchema>;

type PlanFeaturesProps = {
  watch: UseFormWatch<PlanFormData>;
  setValue: UseFormSetValue<PlanFormData>;
};

// Sortable row component for drag and drop
function SortableFeatureRow({
  feature,
  onRemove,
  onEdit,
}: {
  feature: any;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations("plans");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });
  const isMounted = useIsMounted();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="border-border hover:bg-muted/50 transition-colors"
    >
      <TableCell>
        <div
          className="flex items-center cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{feature.key}</TableCell>
      <TableCell>{feature.value}</TableCell>
      <TableCell>
        {feature.description && (
          <span className="text-sm text-muted-foreground">
            {feature.description}
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={feature.included ? "default" : "secondary"}>
          {!isMounted || feature.included ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              {t("included")}
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              {t("not included")}
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {feature.note && (
          <span className="text-xs text-muted-foreground">{feature.note}</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">{t("edit")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("remove")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function PlanFeatures({ watch, setValue }: PlanFeaturesProps) {
  const t = useTranslations("plans");
  const featuresFormRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

  // Watch the features array from the main form
  const features = watch("features") || [];

  // State for editing feature
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Add features with IDs for drag and drop
  const featuresWithIds = features.map((feature) => ({
    ...feature,
    id: feature.key, // Use key as ID for drag and drop
  }));

  // Form for adding/editing features
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    watch: watchAdd,
    setValue: setValueAdd,
    setError: setErrorAdd,
    clearErrors: clearErrorsAdd,
    formState: { errors: errorsAdd, isDirty: isDirtyAdd, isValid: isValidAdd },
  } = useForm<AddFeatureFormData>({
    resolver: zodResolver(addFeatureSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
      included: true,
      note: "",
    },
  });

  const includedValue = watchAdd("included");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = featuresWithIds.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = featuresWithIds.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the features array
        const newFeatures = [...features];
        const [removed] = newFeatures.splice(oldIndex, 1);
        newFeatures.splice(newIndex, 0, removed);
        setValue("features", newFeatures, {
          shouldDirty: true,
        });
      }
    }
  };

  const addFeature = (data: AddFeatureFormData) => {
    // Check for key uniqueness
    const existingKeys = features
      .filter((f) => f.key !== editingKey) // Exclude currently editing feature
      .map((f) => f.key);

    if (existingKeys.includes(data.key)) {
      setErrorAdd("key", {
        type: "manual",
        message: "Feature key must be unique",
      });
      return;
    }

    // Clear any previous key errors
    clearErrorsAdd("key");

    if (editingKey !== null) {
      // Update existing feature
      const newFeatures = features.map((feature) =>
        feature.key === editingKey ? data : feature
      );
      setValue("features", newFeatures, {
        shouldDirty: true,
      });
      setEditingKey(null);
    } else {
      // Add new feature
      const newFeatures = [...features, data];
      setValue("features", newFeatures),
        {
          shouldDirty: true,
        };
    }
    resetAdd();
  };

  const removeFeature = (featureKey: string) => {
    const newFeatures = features.filter(
      (feature) => feature.key !== featureKey
    );
    setValue("features", newFeatures, {
      shouldDirty: true,
    });
    // Reset editing state if the edited feature is being removed
    if (editingKey === featureKey) {
      setEditingKey(null);
      resetAdd();
    }
  };

  const editFeature = (featureKey: string) => {
    const feature = features.find((f) => f.key === featureKey);
    if (!feature) return;

    setEditingKey(featureKey);
    setValueAdd("key", feature.key);
    setValueAdd("value", feature.value || "");
    setValueAdd("description", feature.description || "");
    setValueAdd("included", feature.included);
    setValueAdd("note", feature.note || "");
    // Smooth scroll to the feature form
    setTimeout(() => {
      featuresFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100); // Small delay to ensure state updates are applied
  };

  const cancelEdit = () => {
    setEditingKey(null);
    resetAdd();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("features")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features Data Table */}
        {featuresWithIds.length > 0 && (
          <div className="rounded-md border w-0 min-w-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-medium">
                      {t("feature key")}
                    </TableHead>
                    <TableHead className="font-medium">
                      {t("feature value")}
                    </TableHead>
                    <TableHead className="font-medium">
                      {t("feature description")}
                    </TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">
                      {t("feature note")}
                    </TableHead>
                    <TableHead className="font-medium text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody suppressHydrationWarning>
                  <SortableContext
                    items={featuresWithIds.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {featuresWithIds.map((field) => (
                      <SortableFeatureRow
                        key={field.id}
                        feature={field}
                        onRemove={() => removeFeature(field.key)}
                        onEdit={() => editFeature(field.key)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        )}

        {/* Add/Edit Feature Form */}
        <Card ref={featuresFormRef}>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingKey !== null ? (
                <>
                  <Edit className="h-5 w-5 mr-2 inline" />
                  {t("edit feature")}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2 inline" />
                  {t("add feature")}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAdd(addFeature)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <Label htmlFor="add-key">{t("feature key")}</Label>
                  <Input
                    id="add-key"
                    placeholder="e.g., storage"
                    {...registerAdd("key")}
                  />
                  {errorsAdd.key && (
                    <p className="text-sm text-destructive mt-1">
                      {errorsAdd.key.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="add-value">{t("feature value")}</Label>
                  <Input
                    id="add-value"
                    placeholder="e.g., 100GB"
                    {...registerAdd("value")}
                  />
                  {errorsAdd.value && (
                    <p className="text-sm text-destructive mt-1">
                      {errorsAdd.value.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="add-description">
                    {t("feature description")}
                  </Label>
                  <Input
                    id="add-description"
                    placeholder="Description of this feature"
                    {...registerAdd("description")}
                  />
                  {errorsAdd.description && (
                    <p className="text-sm text-destructive mt-1">
                      {errorsAdd.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="add-note">{t("feature note")}</Label>
                  <Input
                    id="add-note"
                    placeholder="Optional note"
                    {...registerAdd("note")}
                  />
                </div>

                <div>
                  <Label>{t("feature included")}</Label>
                  <div>
                    <Switch
                      className="block"
                      checked={includedValue}
                      onCheckedChange={(checked) =>
                        setValueAdd("included", checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {editingKey !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  disabled={!!editingKey && !isDirtyAdd}
                  type="submit"
                  size="sm"
                >
                  {editingKey !== null ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("update")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("add")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

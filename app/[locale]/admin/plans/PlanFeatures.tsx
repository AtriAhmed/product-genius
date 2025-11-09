"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ListChecks, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import AddFeatureDialog, { AddFeatureFormData } from "./AddFeatureDialog";
import SortableFeatureRow from "./PlanFeatureRow";
import { PlanFormData } from "./types";

type PlanFeaturesProps = {
  watch: UseFormWatch<PlanFormData>;
  setValue: UseFormSetValue<PlanFormData>;
};

export default function PlanFeatures({ watch, setValue }: PlanFeaturesProps) {
  const t = useTranslations("plans");

  // Watch the features array from the main form
  const features = watch("features") || [];

  // State for dialog and editing
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<AddFeatureFormData | null>(null);

  // Add features with IDs for drag and drop
  const featuresWithIds = features.map((feature) => ({
    ...feature,
    id: feature.key, // Use key as ID for drag and drop
  }));

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
      const oldIndex = featuresWithIds.findIndex((field) => field.id === active.id);
      const newIndex = featuresWithIds.findIndex((field) => field.id === over.id);

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

  const handleFeatureSubmit = (data: AddFeatureFormData) => {
    if (editingFeature) {
      // Update existing feature
      const newFeatures = featuresWithIds.map((feature) => (feature.key === editingFeature.key ? data : feature));
      setValue("features", newFeatures, {
        shouldDirty: true,
      });
    } else {
      // Add new feature
      const newFeatures = [...features, data];
      setValue("features", newFeatures, {
        shouldDirty: true,
      });
    }

    setEditingFeature(null);
  };

  const removeFeature = (featureKey: string) => {
    const newFeatures = featuresWithIds.filter((feature) => feature.key !== featureKey);
    setValue("features", newFeatures, {
      shouldDirty: true,
    });
  };

  const openEditDialog = (featureKey: string) => {
    const feature = featuresWithIds.find((f) => f.key === featureKey);
    if (!feature) return;

    // Convert the feature to the AddFeatureFormData type
    const editingData: AddFeatureFormData = {
      key: feature.key,
      value: feature.value,
      description: feature.description,
      included: feature.included,
      note: feature.note,
    };

    setEditingFeature(editingData);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFeature(null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between items-center gap-2">
        <CardTitle className="flex items-center gap-2">{t("features")}</CardTitle>
        <div className="flex justify-end ms-auto">
          <Button onClick={openAddDialog} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("add feature")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features Data Table */}
        <div className="w-0 min-w-full border rounded-md">
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
                  <TableHead className="font-medium">{t("feature key")}</TableHead>
                  <TableHead className="font-medium">{t("feature value")}</TableHead>
                  <TableHead className="font-medium">{t("feature description")}</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">{t("feature note")}</TableHead>
                  <TableHead className="font-medium text-center">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuresWithIds.length > 0 ? (
                  <SortableContext
                    items={featuresWithIds.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {featuresWithIds.map((field) => (
                      <SortableFeatureRow
                        key={field.id}
                        feature={field}
                        onRemove={() => removeFeature(field.key)}
                        onEdit={() => openEditDialog(field.key)}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32">
                      <div className="flex flex-col justify-center items-center text-muted-foreground text-center">
                        <ListChecks className="w-8 h-8 mb-2" />
                        <p className="font-medium text-sm">{t("no features available")}</p>
                        <p className="text-xs">{t("add features to your plan")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Add/Edit Feature Dialog */}
        <AddFeatureDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleFeatureSubmit}
          editingFeature={editingFeature}
          existingKeys={features.map((f) => f.key)}
        />
      </CardContent>
    </Card>
  );
}

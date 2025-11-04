"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Package, Plus, Users } from "lucide-react";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import AddSupplierDialog from "./AddSupplierDialog";
import { AddSupplierFormData, ProductFormData } from "./types";
import SortableSupplierRow from "@/app/[locale]/admin/products/ProductSupplierRow";

type ProductSuppliersProps = {
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
};

export default function ProductSuppliers({
  watch,
  setValue,
}: ProductSuppliersProps) {
  const t = useTranslations("products");

  // Watch the suppliers array from the main form
  const suppliers = watch("suppliers") || [];

  // State for dialog and editing
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<AddSupplierFormData | null>(null);

  // Add suppliers with temp IDs for drag and drop
  const suppliersWithIds = suppliers.map((supplier, index) => ({
    ...supplier,
    id: supplier.id?.toString(), // Generate temp ID for drag and drop only
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
      const oldIndex = suppliersWithIds.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = suppliersWithIds.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the suppliers array
        const newSuppliers = [...suppliers];
        const [removed] = newSuppliers.splice(oldIndex, 1);
        newSuppliers.splice(newIndex, 0, removed);
        setValue("suppliers", newSuppliers, {
          shouldDirty: true,
        });
      }
    }
  };

  const handleSupplierSubmit = (data: AddSupplierFormData) => {
    // If supplier is internal, clear marketplace and url
    const supplierData = {
      id: editingSupplier?.id || nanoid(), // Keep existing id when editing, or generate new one
      url: data.isInternal ? undefined : data.url || undefined,
      marketplace: data.isInternal ? undefined : data.marketplace || undefined,
      price: data.price,
      currency: data.currency,
      isInternal: data.isInternal,
      notes: data.notes,
    };

    if (editingSupplier) {
      // Update existing supplier
      const newSuppliers = suppliersWithIds.map((supplier) =>
        // loose equality to match string and number IDs
        supplier.id == supplierData.id ? supplierData : supplier
      );
      setValue("suppliers", newSuppliers, {
        shouldDirty: true,
      });
    } else {
      // Add new supplier
      const newSuppliers = [...suppliers, supplierData];
      setValue("suppliers", newSuppliers, {
        shouldDirty: true,
      });
    }

    setEditingSupplier(null);
  };

  const removeSupplier = (id: string | number) => {
    const newSuppliers = suppliersWithIds.filter(
      (supplier) => supplier.id !== id
    );
    setValue("suppliers", newSuppliers, {
      shouldDirty: true,
    });
  };

  const openEditDialog = (id: string | number) => {
    const supplier = suppliersWithIds.find((s) => s.id === id);
    if (!supplier) return;

    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between items-center gap-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t("external suppliers")}
        </CardTitle>
        <div className="flex justify-end ms-auto">
          <Button onClick={openAddDialog} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("add supplier")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suppliers Data Table */}
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
                  <TableHead className="font-medium">
                    {t("marketplace")}
                  </TableHead>
                  <TableHead className="font-medium">{t("url")}</TableHead>
                  <TableHead className="font-medium">{t("price")}</TableHead>
                  <TableHead className="font-medium">{t("type")}</TableHead>
                  <TableHead className="min-w-[150px] font-medium">
                    {t("notes")}
                  </TableHead>
                  <TableHead className="font-medium text-center">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliersWithIds.length > 0 ? (
                  <SortableContext
                    items={suppliersWithIds.map((field) => field.id!)}
                    strategy={verticalListSortingStrategy}
                  >
                    {suppliersWithIds.map((field) => (
                      <SortableSupplierRow
                        key={field.id}
                        supplier={field}
                        onRemove={() => removeSupplier(field.id!)}
                        onEdit={() => openEditDialog(field.id!)}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32">
                      <div className="flex flex-col justify-center items-center text-muted-foreground text-center">
                        <Package className="w-8 h-8 mb-2" />
                        <p className="font-medium text-sm">
                          {t("no suppliers available")}
                        </p>
                        <p className="text-xs">
                          {t("add suppliers to your product")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Add/Edit Supplier Dialog */}
        <AddSupplierDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSupplierSubmit}
          editingSupplier={editingSupplier}
        />
      </CardContent>
    </Card>
  );
}

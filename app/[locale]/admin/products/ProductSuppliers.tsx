"use client";

import { Badge } from "@/components/ui/badge";
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
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Edit,
  GripVertical,
  Package,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import AddSupplierDialog from "./AddSupplierDialog";
import { AddSupplierFormData, ProductFormData } from "./types";

type ProductSuppliersProps = {
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
};

// ------- DropdownSelect (separate component, kept in this file so you can copy/paste) -------

// Sortable row component for drag and drop
function SortableSupplierRow({
  supplier,
  onRemove,
  onEdit,
}: {
  supplier: AddSupplierFormData;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations("products");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: supplier.id?.toString() || "" });
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
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {supplier.marketplace || "—"}
      </TableCell>
      <TableCell>
        {supplier.url ? (
          <a
            href={supplier.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {supplier.url.length > 40
              ? `${supplier.url.substring(0, 40)}...`
              : supplier.url}
          </a>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="font-semibold text-nowrap">
        {supplier.price ? `${supplier.price} ${supplier.currency || ""}` : "—"}
      </TableCell>
      <TableCell>
        <Badge variant={supplier.isInternal ? "primary" : "secondary"}>
          {!isMounted || supplier.isInternal ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              {t("internal")}
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              {t("external")}
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {supplier.notes && (
          <span className="text-muted-foreground text-xs">
            {supplier.notes}
          </span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
            <span className="sr-only">{t("edit")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">{t("remove")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

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
          {t("suppliers")}
        </CardTitle>
        <div className="flex justify-end ms-auto">
          <Button onClick={openAddDialog} variant="primary">
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
                          No suppliers available
                        </p>
                        <p className="text-xs">Add a supplier to get started</p>
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

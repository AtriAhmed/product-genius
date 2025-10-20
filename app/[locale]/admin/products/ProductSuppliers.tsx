"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
/* removed Switch import */
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
import { AddSupplierFormData, ProductFormData, supplierSchema } from "./types";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { nanoid } from "nanoid";

/* Select imports (used by DropdownSelect) */
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Marketplace, MARKETPLACES } from "@/types";
import { CURRENCIES } from "@/types/constants";
import { DropdownSelect, Option } from "@/components/Dropdown";

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
  supplier: any;
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
  } = useSortable({ id: supplier.tempId });
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
      <TableCell className="font-medium">
        {supplier.marketplace || "N/A"}
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
          "N/A"
        )}
      </TableCell>
      <TableCell>
        {supplier.price
          ? `${supplier.price} ${supplier.currency || ""}`
          : "N/A"}
      </TableCell>
      <TableCell>
        <Badge variant={supplier.isInternal ? "primary" : "secondary"}>
          {!isMounted || supplier.isInternal ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              {t("internal")}
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              {t("external")}
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {supplier.notes && (
          <span className="text-xs text-muted-foreground">
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

export default function ProductSuppliers({
  watch,
  setValue,
}: ProductSuppliersProps) {
  const t = useTranslations("products");
  const suppliersFormRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

  // Watch the suppliers array from the main form
  const suppliers = watch("suppliers") || [];

  // State for editing supplier
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add suppliers with temp IDs for drag and drop
  const suppliersWithIds = suppliers.map((supplier, index) => ({
    ...supplier,
    tempId: supplier.tempId || nanoid(), // Generate temp ID for drag and drop only
  }));

  // Marketplace and currency options (adjust as needed)
  const MARKETPLACE_OPTIONS: Option[] = [
    { value: "AMAZON", label: "Amazon" },
    { value: "ALIEXPRESS", label: "AliExpress" },
  ];

  const CURRENCY_OPTIONS: Option[] = CURRENCIES?.map((c) => ({
    value: c.code,
    label: c.code,
  }));

  // Form for adding/editing suppliers
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    watch: watchAdd,
    setValue: setValueAdd,
    setError: setErrorAdd,
    clearErrors: clearErrorsAdd,
    formState: { errors: errorsAdd, isDirty: isDirtyAdd },
  } = useForm<AddSupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      url: "",
      marketplace: "",
      price: undefined,
      currency: "",
      isInternal: false,
      notes: "",
    },
  });

  const isInternalValue = watchAdd("isInternal");
  const marketplaceValue = watchAdd("marketplace");
  const currencyValue = watchAdd("currency");

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
        (field) => field.tempId === active.id
      );
      const newIndex = suppliersWithIds.findIndex(
        (field) => field.tempId === over.id
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

  const addSupplier = (data: AddSupplierFormData) => {
    // If supplier is internal, clear marketplace and url
    const supplierData = {
      tempId: editingId || nanoid(), // Keep existing tempId when editing, or generate new one
      url: data.isInternal ? undefined : data.url || undefined,
      marketplace: data.isInternal ? undefined : data.marketplace || undefined,
      price: data.price || undefined,
      currency: data.currency || undefined,
      isInternal: data.isInternal,
      notes: data.notes || undefined,
    };

    if (editingId !== null) {
      // Update existing supplier
      const newSuppliers = suppliers.map((supplier) =>
        supplier.tempId === editingId ? supplierData : supplier
      );
      setValue("suppliers", newSuppliers, {
        shouldDirty: true,
      });
      setEditingId(null);
    } else {
      // Add new supplier
      const newSuppliers = [...suppliers, supplierData];
      setValue("suppliers", newSuppliers, {
        shouldDirty: true,
      });
    }
    resetAdd();
  };

  const removeSupplier = (tempId: string) => {
    const newSuppliers = suppliers.filter(
      (supplier) => supplier.tempId !== tempId
    );
    setValue("suppliers", newSuppliers, {
      shouldDirty: true,
    });
    // Reset editing state if the edited supplier is being removed
    if (editingId === tempId) {
      setEditingId(null);
      resetAdd();
    }
  };

  const editSupplier = (tempId: string) => {
    const supplier = suppliers.find((s) => s.tempId === tempId);
    if (!supplier) return;

    setEditingId(tempId);
    setValueAdd("url", supplier.url || "");
    setValueAdd("marketplace", supplier.marketplace || "");
    setValueAdd("price", supplier.price || undefined);
    setValueAdd("currency", supplier.currency || "");
    setValueAdd("isInternal", !!supplier.isInternal);
    setValueAdd("notes", supplier.notes || "");
    // Smooth scroll to the supplier form
    setTimeout(() => {
      suppliersFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetAdd();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("suppliers")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suppliers Data Table */}
        {suppliersWithIds.length > 0 && (
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
                      {t("marketplace")}
                    </TableHead>
                    <TableHead className="font-medium">{t("url")}</TableHead>
                    <TableHead className="font-medium">{t("price")}</TableHead>
                    <TableHead className="font-medium">{t("type")}</TableHead>
                    <TableHead className="font-medium">{t("notes")}</TableHead>
                    <TableHead className="font-medium text-center">
                      {t("actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={suppliersWithIds.map((field) => field.tempId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {suppliersWithIds.map((field) => (
                      <SortableSupplierRow
                        key={field.tempId}
                        supplier={field}
                        onRemove={() => removeSupplier(field.tempId)}
                        onEdit={() => editSupplier(field.tempId)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        )}

        {/* Add/Edit Supplier Form */}
        <Card ref={suppliersFormRef}>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId !== null ? (
                <>
                  <Edit className="h-5 w-5 mr-2 inline" />
                  {t("edit supplier")}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2 inline" />
                  {t("add supplier")}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Internal/External buttons at top of form */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                size="sm"
                variant={isInternalValue ? "primary" : "outline"}
                className={isInternalValue ? "" : ""}
                onClick={() => {
                  setValueAdd("isInternal", true, { shouldDirty: true });
                  // clear fields not needed for internal suppliers
                  setValueAdd("url", "", { shouldDirty: true });
                  setValueAdd("marketplace", "", { shouldDirty: true });
                }}
              >
                {t("internal") || "Internal"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!isInternalValue ? "primary" : "outline"}
                onClick={() => {
                  setValueAdd("isInternal", false, { shouldDirty: true });
                }}
              >
                {t("external") || "External"}
              </Button>
            </div>

            <form onSubmit={handleSubmitAdd(addSupplier)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {/* Marketplace - only when external */}
                {!isInternalValue && (
                  <div>
                    <Label htmlFor="add-marketplace">{t("marketplace")}</Label>
                    <DropdownSelect
                      id="add-marketplace"
                      value={marketplaceValue || ""}
                      onValueChange={(value) =>
                        setValueAdd("marketplace", value as Marketplace, {
                          shouldDirty: true,
                        })
                      }
                      options={MARKETPLACE_OPTIONS}
                      placeholder="Select a marketplace"
                    />
                    {errorsAdd.marketplace && (
                      <p className="text-sm text-destructive mt-1">
                        {errorsAdd.marketplace.message}
                      </p>
                    )}
                  </div>
                )}

                {/* URL - only when external */}
                {!isInternalValue && (
                  <div className={isInternalValue ? "hidden" : ""}>
                    <Label htmlFor="add-url">{t("supplier url")}</Label>
                    <Input
                      id="add-url"
                      placeholder="https://example.com/product"
                      {...registerAdd("url")}
                    />
                    {errorsAdd.url && (
                      <p className="text-sm text-destructive mt-1">
                        {errorsAdd.url.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Price */}
                <div>
                  <Label htmlFor="add-price">{t("price")}</Label>
                  <Input
                    id="add-price"
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    {...registerAdd("price", {
                      setValueAs: (v) => (v === "" ? null : Number(v)),
                    })}
                  />
                  {errorsAdd.price && (
                    <p className="text-sm text-destructive mt-1">
                      {errorsAdd.price.message}
                    </p>
                  )}
                </div>

                {/* Currency (Select) */}
                <div>
                  <Label htmlFor="add-currency">{t("currency")}</Label>
                  <DropdownSelect
                    id="add-currency"
                    value={currencyValue || ""}
                    onValueChange={(value) =>
                      setValueAdd("currency", value, { shouldDirty: true })
                    }
                    options={CURRENCY_OPTIONS}
                    placeholder="Select a currency"
                  />
                  {errorsAdd.currency && (
                    <p className="text-sm text-destructive mt-1">
                      {errorsAdd.currency.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="add-notes">{t("notes")}</Label>
                  <Input
                    id="add-notes"
                    placeholder="Optional notes about this supplier"
                    {...registerAdd("notes")}
                  />
                </div>

                {/* (Removed the Switch UI — replaced with the buttons above) */}
              </div>

              <div className="flex justify-end gap-2">
                {editingId !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    {t("cancel")}
                  </Button>
                )}
                <Button
                  disabled={!!editingId && !isDirtyAdd}
                  type="submit"
                  size="sm"
                >
                  {editingId !== null ? (
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

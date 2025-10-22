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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Edit,
  GripVertical,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useForm, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { AddSupplierFormData, ProductFormData, supplierSchema } from "./types";

/* Select imports (used by DropdownSelect) */
import { DropdownSelect, Option } from "@/components/Dropdown";
import { Marketplace, Supplier } from "@/types";
import { CURRENCIES } from "@/types/constants";

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
  } = useSortable({ id: supplier.id?.toString() });
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
        <Badge
          variant={supplier.available ? "default" : "destructive"}
          className={supplier.available ? "bg-green-700" : ""}
        >
          {!isMounted || supplier.available ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              {t("available")}
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              {t("unavailable")}
            </>
          )}
        </Badge>
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
  const suppliersFormRef = useRef<HTMLDivElement>(null);

  // Watch the suppliers array from the main form
  const suppliers = watch("suppliers") || [];

  // State for editing supplier
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add suppliers with temp IDs for drag and drop
  const suppliersWithIds = suppliers.map((supplier, index) => ({
    ...supplier,
    id: supplier.id?.toString(), // Generate temp ID for drag and drop only
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
      url: undefined,
      marketplace: undefined,
      price: undefined,
      currency: "EUR",
      isInternal: false,
      available: true,
      notes: "",
    },
  });

  const isInternalValue = watchAdd("isInternal");
  const marketplaceValue = watchAdd("marketplace");
  const currencyValue = watchAdd("currency");
  const availableValue = watchAdd("available");

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

  const addSupplier = (data: AddSupplierFormData) => {
    console.log("-------------------- data --------------------");
    console.log(data);
    // If supplier is internal, clear marketplace and url
    const supplierData = {
      id: editingId || nanoid(), // Keep existing id when editing, or generate new one
      url: data.isInternal ? undefined : data.url || undefined,
      marketplace: data.isInternal ? undefined : data.marketplace || undefined,
      price: data.price,
      currency: data.currency,
      isInternal: data.isInternal,
      notes: data.notes,
      available: data.available,
    };

    if (editingId !== null) {
      // Update existing supplier
      const newSuppliers = suppliersWithIds.map((supplier) =>
        // loose equality to match string and number IDs
        supplier.id == supplierData.id ? supplierData : supplier
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

  const removeSupplier = (id: string | number) => {
    const newSuppliers = suppliersWithIds.filter(
      (supplier) => supplier.id !== id
    );
    setValue("suppliers", newSuppliers, {
      shouldDirty: true,
    });
    // Reset editing state if the edited supplier is being removed
    if (editingId === id) {
      setEditingId(null);
      resetAdd();
    }
  };

  const editSupplier = (id: string | number) => {
    const supplier = suppliersWithIds.find((s) => s.id === id);
    if (!supplier) return;

    setEditingId(id.toString());
    setValueAdd("url", supplier.url);
    setValueAdd("marketplace", supplier.marketplace);
    setValueAdd("price", supplier.price || undefined);
    setValueAdd("currency", supplier.currency || "EUR");
    setValueAdd("isInternal", !!supplier.isInternal);
    setValueAdd("available", supplier.available !== false);
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
                  <TableHead className="font-medium">
                    {t("availability")}
                  </TableHead>
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
                    items={suppliersWithIds.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {suppliersWithIds.map((field) => (
                      <SortableSupplierRow
                        key={field.id}
                        supplier={field}
                        onRemove={() => removeSupplier(field.id)}
                        onEdit={() => editSupplier(field.id)}
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

        {/* Add/Edit Supplier Form */}
        <Card ref={suppliersFormRef}>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId !== null ? (
                <>
                  <Edit className="inline w-5 h-5 mr-2" />
                  {t("edit supplier")}
                </>
              ) : (
                <>
                  <Plus className="inline w-5 h-5 mr-2" />
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
                  setValueAdd("marketplace", undefined, { shouldDirty: true });
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
              <div className="gap-x-4 gap-y-2 grid grid-cols-1 md:grid-cols-2">
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
                      <p className="mt-1 text-destructive text-sm">
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
                      <p className="mt-1 text-destructive text-sm">
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
                    <p className="mt-1 text-destructive text-sm">
                      {errorsAdd.price.message}
                    </p>
                  )}
                </div>

                {/* Currency (Select) */}
                <div>
                  <Label htmlFor="add-currency">{t("currency")}</Label>
                  <DropdownSelect
                    id="add-currency"
                    value={currencyValue || "EUR"}
                    onValueChange={(value) =>
                      setValueAdd("currency", value, { shouldDirty: true })
                    }
                    options={CURRENCY_OPTIONS}
                    placeholder="Select a currency"
                  />
                  {errorsAdd.currency && (
                    <p className="mt-1 text-destructive text-sm">
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

                <div className="md:col-span-2">
                  <Label htmlFor="add-available">{t("available")}</Label>
                  <Switch
                    id="add-available"
                    checked={availableValue}
                    onCheckedChange={(checked) =>
                      setValueAdd("available", checked, { shouldDirty: true })
                    }
                    className="block"
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
                      <Edit className="w-4 h-4 mr-2" />
                      {t("update")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
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

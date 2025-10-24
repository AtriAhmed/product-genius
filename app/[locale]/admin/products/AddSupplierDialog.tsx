"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownSelect, Option } from "@/components/Dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { AddSupplierFormData, supplierSchema } from "./types";
import { Marketplace } from "@/types";
import { CURRENCIES } from "@/types/constants";
import { useEffect } from "react";

type AddSupplierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddSupplierFormData) => void;
  editingSupplier?: AddSupplierFormData | null;
};

export default function AddSupplierDialog({
  open,
  onOpenChange,
  onSubmit,
  editingSupplier,
}: AddSupplierDialogProps) {
  const t = useTranslations("products");

  // Marketplace and currency options
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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AddSupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      url: undefined,
      marketplace: undefined,
      price: undefined,
      currency: "EUR",
      isInternal: false,
      notes: "",
    },
  });

  const isInternalValue = watch("isInternal");
  const marketplaceValue = watch("marketplace");
  const currencyValue = watch("currency");

  // Reset form when dialog opens/closes or when editing supplier changes
  useEffect(() => {
    if (editingSupplier) {
      setValue("url", editingSupplier.url);
      setValue("marketplace", editingSupplier.marketplace);
      setValue("price", editingSupplier.price || undefined);
      setValue("currency", editingSupplier.currency || "EUR");
      setValue("isInternal", !!editingSupplier.isInternal);
      setValue("notes", editingSupplier.notes || "");
    } else {
      reset({
        url: undefined,
        marketplace: undefined,
        price: undefined,
        currency: "EUR",
        isInternal: false,
        notes: "",
      });
    }
  }, [editingSupplier, setValue, reset]);

  const handleFormSubmit = (data: AddSupplierFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSupplier ? (
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
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Internal/External buttons at top of form */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={isInternalValue ? "default" : "outline"}
              onClick={() => {
                setValue("isInternal", true, { shouldDirty: true });
                setValue("url", "", { shouldDirty: true });
                setValue("marketplace", undefined, { shouldDirty: true });
              }}
            >
              {t("internal") || "Internal"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!isInternalValue ? "default" : "outline"}
              onClick={() => {
                setValue("isInternal", false, { shouldDirty: true });
              }}
            >
              {t("external") || "External"}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Marketplace - only when external */}
            {!isInternalValue && (
              <div>
                <Label htmlFor="marketplace">{t("marketplace")}</Label>
                <DropdownSelect
                  id="marketplace"
                  value={marketplaceValue || ""}
                  onValueChange={(value) =>
                    setValue("marketplace", value as Marketplace, {
                      shouldDirty: true,
                    })
                  }
                  options={MARKETPLACE_OPTIONS}
                  placeholder="Select a marketplace"
                />
                {errors.marketplace && (
                  <p className="mt-1 text-destructive text-sm">
                    {errors.marketplace.message}
                  </p>
                )}
              </div>
            )}

            {/* URL - only when external */}
            {!isInternalValue && (
              <div>
                <Label htmlFor="url">{t("supplier url")}</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/product"
                  {...register("url")}
                />
                {errors.url && (
                  <p className="mt-1 text-destructive text-sm">
                    {errors.url.message}
                  </p>
                )}
              </div>
            )}

            {/* Price */}
            <div>
              <Label htmlFor="price">{t("price")}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="99.99"
                {...register("price", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              {errors.price && (
                <p className="mt-1 text-destructive text-sm">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">{t("currency")}</Label>
              <DropdownSelect
                id="currency"
                value={currencyValue || "EUR"}
                onValueChange={(value) =>
                  setValue("currency", value, { shouldDirty: true })
                }
                options={CURRENCY_OPTIONS}
                placeholder="Select a currency"
              />
              {errors.currency && (
                <p className="mt-1 text-destructive text-sm">
                  {errors.currency.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">{t("notes")}</Label>
              <Input
                id="notes"
                placeholder="Optional notes about this supplier"
                {...register("notes")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={!!editingSupplier && !isDirty}
              type="submit"
              size="sm"
            >
              {editingSupplier ? (
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
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema for the add feature form
const addFeatureSchema = z.object({
  key: z.string().min(1, "Feature key is required"),
  value: z.string().optional(),
  description: z.string().optional(),
  included: z.boolean(),
  note: z.string().optional(),
});

export type AddFeatureFormData = z.infer<typeof addFeatureSchema>;

type AddFeatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddFeatureFormData) => void;
  editingFeature?: AddFeatureFormData | null;
  existingKeys: string[];
};

export default function AddFeatureDialog({
  open,
  onOpenChange,
  onSubmit,
  editingFeature,
  existingKeys,
}: AddFeatureDialogProps) {
  const t = useTranslations("plans");

  // Form for adding/editing features
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
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

  const includedValue = watch("included");

  // Reset form when dialog opens/closes or when editing feature changes
  useEffect(() => {
    if (editingFeature) {
      setValue("key", editingFeature.key);
      setValue("value", editingFeature.value || "");
      setValue("description", editingFeature.description || "");
      setValue("included", editingFeature.included);
      setValue("note", editingFeature.note || "");
    } else {
      reset({
        key: "",
        value: "",
        description: "",
        included: true,
        note: "",
      });
    }
  }, [editingFeature, setValue, reset]);

  const handleFormSubmit = (data: AddFeatureFormData) => {
    // Check for key uniqueness (exclude current key when editing)
    const keysToCheck = editingFeature ? existingKeys.filter((k) => k !== editingFeature.key) : existingKeys;

    if (keysToCheck.includes(data.key)) {
      setError("key", {
        type: "manual",
        message: "Feature key must be unique",
      });
      return;
    }

    // Clear any previous key errors
    clearErrors("key");

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
            {editingFeature ? (
              <>
                <Edit className="inline w-5 h-5 mr-2" />
                {t("edit feature")}
              </>
            ) : (
              <>
                <Plus className="inline w-5 h-5 mr-2" />
                {t("add feature")}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-4">
            {/* Feature Key */}
            <div>
              <Label htmlFor="key">{t("feature key")}</Label>
              <Input id="key" placeholder="e.g., storage" {...register("key")} />
              {errors.key && <p className="mt-1 text-destructive text-sm">{errors.key.message}</p>}
            </div>

            {/* Feature Value */}
            <div>
              <Label htmlFor="value">{t("feature value")}</Label>
              <Input id="value" placeholder="e.g., 100GB" {...register("value")} />
              {errors.value && <p className="mt-1 text-destructive text-sm">{errors.value.message}</p>}
            </div>

            {/* Feature Description */}
            <div>
              <Label htmlFor="description">{t("feature description")}</Label>
              <Input
                id="description"
                placeholder="Description of this feature (optional)"
                {...register("description")}
              />
              {errors.description && <p className="mt-1 text-destructive text-sm">{errors.description.message}</p>}
            </div>

            {/* Feature Note */}
            <div>
              <Label htmlFor="note">{t("feature note")}</Label>
              <Input id="note" placeholder="Optional note" {...register("note")} />
            </div>

            {/* Feature Included */}
            <div>
              <Label>{t("feature included")}</Label>
              <div>
                <Switch
                  className="block"
                  checked={includedValue}
                  onCheckedChange={(checked) =>
                    setValue("included", checked, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              {t("cancel")}
            </Button>
            <Button disabled={!!editingFeature && !isDirty} type="submit" size="sm">
              {editingFeature ? (
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

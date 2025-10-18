"use client";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Plan } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Import separated components
import CopyPlanDropdown from "@/app/[locale]/admin/plans/CopyPlanDropdown";
import PlanBasicInformation from "@/app/[locale]/admin/plans/PlanBasicInformation";
import PlanFeatures from "@/app/[locale]/admin/plans/PlanFeatures";
import { PlanFormData, planFormSchema } from "./types";

type PlanFormProps = {
  plan?: Plan | null;
  mode: "create" | "edit";
};

export default function PlanForm({ plan, mode }: PlanFormProps) {
  const router = useRouter();
  const t = useTranslations("plans");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      oldPrice: plan?.oldPrice || null,
      price: plan?.price || 0,
      interval: plan?.interval || "MONTH",
      active: plan?.active ?? true,
      features: plan?.features || [],
      mostPopular: plan?.mostPopular || false,
      sortOrder: plan?.sortOrder || 0,
    },
  });

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await axios.post("/api/plans", data);
        toast.success(t("plan created successfully"));
        router.push("/admin/plans");
      } else {
        await axios.put(`/api/plans/${plan?.id}`, data);
        toast.success(t("plan updated successfully"));
        router.push("/admin/plans");
      }
    } catch (error) {
      const message =
        mode === "create"
          ? t("failed to create plan")
          : t("failed to update plan");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!plan?.id) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/plans/${plan.id}`);
      toast.success(t("plan deleted successfully"));
      router.push("/admin/plans");
    } catch (error) {
      toast.error(t("failed to delete plan"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-2 px-4">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "create" ? t("create plan") : t("edit plan")}
              </h1>
              <p className="text-muted-foreground">
                {mode === "create"
                  ? t("add a new plan to your catalog")
                  : t("update plan information")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className=""
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("delete")}
              </Button>
            )}

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting || !isDirty}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? mode === "create"
                  ? t("creating")
                  : t("updating")
                : mode === "create"
                ? t("create")
                : t("update")}
            </Button>
          </div>
        </div>

        {/* Copy Plan Option */}
        {mode === "create" && (
          <div className="mb-4">
            <CopyPlanDropdown setValue={setValue} />
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-2">
          {/* Basic Information */}
          <PlanBasicInformation
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </form>

        {/* Features */}
        <PlanFeatures watch={watch} setValue={setValue} />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t("delete plan")}
          description={t("are you sure delete")}
          confirmText={isDeleting ? t("deleting") : t("delete plan")}
          cancelText={t("back")}
          isLoading={isDeleting}
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}

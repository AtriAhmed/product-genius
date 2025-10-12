"use client";

import MediaUpload from "@/app/[locale]/admin/products/MediaUpload";
import MultiLanguageForm, {
  Translation,
} from "@/app/[locale]/admin/products/ProductContentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Globe, ImageIcon, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import BasicInformation from "@/app/[locale]/admin/products/BasicInformation";
import PricingSection from "@/app/[locale]/admin/products/PricingSection";
import StatusSection from "@/app/[locale]/admin/products/StatusSection";
import { Product } from "@/types";

// Form validation schema
const productFormSchema = z.object({
  suggestedPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean(),
  translations: z
    .array(
      z.object({
        locale: z.string().min(1),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
      })
    )
    .min(1, "At least one translation is required"),
  media: z.array(z.any()),
});

type ProductFormData = z.infer<typeof productFormSchema>;

type ProductFormProps = {
  product?: Product | null;
  mode: "create" | "edit";
};

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      suggestedPrice: product?.suggestedPrice || undefined,
      currency: "USD",
      categoryId: product?.categoryId || undefined,
      isActive: product?.isActive ?? true,
      translations: product?.translations || [
        { locale: "en", title: "", description: "" },
      ],
      media: [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = form;

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && product) {
      // Reset form with product data
      reset({
        suggestedPrice: product.suggestedPrice,
        currency: product.currency || "USD",
        categoryId: product.categoryId,
        isActive: product.isActive ?? true,
        translations: product.translations,
        media: product.media,
      });
    } else if (isCreateMode) {
      // Initialize with default values for create mode
      reset({
        suggestedPrice: undefined,
        currency: "USD",
        categoryId: undefined,
        isActive: true,
        translations: [{ locale: "en", title: "", description: "" }],
        media: [],
      });
    }
  }, [product, isEditMode, isCreateMode, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare form data for multipart upload
      const formData = new FormData();

      // Add product data as JSON
      const productData = {
        ...data,
        media: data.media
          .filter((item: any) => item.url && !item.file)
          .map((item: any) => ({
            url: item.url,
            type: item.type,
            sortOrder: item.sortOrder,
          })),
      };

      formData.append("productData", JSON.stringify(productData));

      // Add media files
      data.media.forEach((item: any) => {
        if (item.file) {
          formData.append(`media_${item.sortOrder}`, item.file);

          // Add poster file if exists (for videos)
          if (item.posterFile) {
            formData.append(`poster_${item.sortOrder}`, item.posterFile);
          }
        }
      });

      const url = isEditMode ? `/api/products/${product!.id}` : "/api/products";

      const response = isEditMode
        ? await axios.put(url, formData)
        : await axios.post(url, formData);

      toast.success(
        t(
          isEditMode
            ? "product updated successfully"
            : "product created successfully"
        )
      );

      if (isCreateMode) {
        router.push("/admin/products");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`Product ${mode} error:`, error);
      toast.error(
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : t(
              isEditMode
                ? "failed to update product"
                : "failed to create product"
            )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!product) return;

    setIsDeleting(true);

    try {
      await axios.delete(`/api/products/${product.id}`);

      toast.success(t("product deleted successfully"));
      router.push("/admin/products");
    } catch (error) {
      console.error("Product deletion error:", error);
      toast.error(
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : t("failed to delete product")
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                {t("back")}
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? t("edit product") : t("create product")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditMode
                    ? t("update product information")
                    : t("add a new product to your catalog")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ms-auto">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-2 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? t("deleting") : t("delete")}
                </Button>
              )}
              <Button
                type="submit"
                form="product-form"
                disabled={!isValid || isSubmitting || !isDirty}
                className="gap-2 text-xs"
                size="sm"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? `${isEditMode ? t("updating") : t("creating")}...`
                  : `${isEditMode ? t("update") : t("create")}`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <BasicInformation
                setValue={setValue}
                errors={errors}
                categories={categories}
                categoryValue={watch("categoryId")}
              />

              {/* Multi-language Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t("product content")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("add product information in multiple languages")}
                  </p>
                </CardHeader>
                <CardContent>
                  <MultiLanguageForm
                    value={watch("translations") || []}
                    onChange={(newTranslations) => {
                      setValue("translations", newTranslations, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    requiredLanguages={[]}
                  />
                  {errors.translations && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.translations.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t("product media")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("upload images and videos")}
                  </p>
                </CardHeader>
                <CardContent>
                  <MediaUpload
                    value={watch("media") || []}
                    onChange={(newMedia) => {
                      setValue("media", newMedia, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    maxFiles={100}
                    maxFileSize={500}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <PricingSection
                register={register}
                watch={watch}
                defaultPrice={product?.suggestedPrice}
                defaultCurrency={product?.currency}
              />

              {/* Status */}
              <StatusSection
                register={register}
                defaultValue={product?.isActive}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {isEditMode && (
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t("delete product")}
          description={t("are you sure you want to delete this product")}
          warningMessage={t("this action cannot be undone")}
          confirmText={t("delete product")}
          cancelText={t("cancel")}
          onConfirm={confirmDelete}
          variant="destructive"
          disabled={isDeleting}
        />
      )}
    </div>
  );
}

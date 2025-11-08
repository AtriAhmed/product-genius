"use client";

import BasicInformation from "@/app/[locale]/admin/products/BasicInformation";
import MediaUpload from "@/app/[locale]/admin/products/MediaUpload";
import ProductContentForm from "@/app/[locale]/admin/products/ProductContentForm";
import PricingSection from "@/app/[locale]/admin/products/PricingSection";
import ProductSuppliers from "@/app/[locale]/admin/products/ProductSuppliers";
import ProductOptions from "@/app/[locale]/admin/products/ProductOptions";
import ProductVariants from "@/app/[locale]/admin/products/ProductVariants";
import PlanSelector from "@/app/[locale]/admin/products/PlanSelector";
import { ProductFormData, productFormSchema } from "@/app/[locale]/admin/products/types";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Marketplace, Plan, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, Globe, ImageIcon, Save, Trash2, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

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
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      price: product?.price || undefined,
      compareAtPrice: product?.compareAtPrice || undefined,
      sellingPrice: product?.sellingPrice || undefined,
      currency: product?.currency || "EUR",
      categoryId: product?.categoryId || undefined,
      planIds: product?.plans?.map((p) => p.id) || [],
      isActive: product?.isActive ?? true,
      translations: product?.translations || [{ locale: "en", title: "", description: "" }],
      media: [],
      suppliers:
        product?.suppliers?.map((s) => ({
          ...s,
          marketplace: s.marketplace as Marketplace,
        })) || [],
      options: product?.options || [],
      variants: product?.variants?.map((v) => ({
        ...v,
        options: Object.fromEntries(v.options?.map((opt) => [opt.optionId, opt.valueId]) || []),
      })),
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

  console.log("-------------------- errors --------------------");
  console.log(errors);

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && product) {
      // Reset form with product data
      reset({
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sellingPrice: product.sellingPrice,
        currency: product.currency || "EUR",
        categoryId: product.categoryId,
        planIds: product.plans?.map((p: Plan) => p.id) || [],
        isActive: product.isActive ?? true,
        translations: product.translations,
        media: product.media,
        suppliers:
          product?.suppliers?.map((s) => ({
            ...s,
            marketplace: s.marketplace as Marketplace,
          })) || [],
        options: product?.options || [],
        // variants: (product?.variants as any[]) || [],
        variants: product?.variants?.map((v) => ({
          ...v,
          options: Object.fromEntries(v.options?.map((opt) => [opt.optionId, opt.valueId]) || []),
        })),
      });
    } else if (isCreateMode) {
      // Initialize with default values for create mode
      reset({
        price: undefined,
        compareAtPrice: undefined,
        sellingPrice: undefined,
        currency: "EUR",
        categoryId: undefined,
        planIds: [],
        isActive: true,
        translations: [{ locale: "en", title: "", description: "" }],
        media: [],
        suppliers: [],
        options: [],
        variants: [],
      });
    }
  }, [product, isEditMode, isCreateMode, reset]);

  console.log("-------------------- product --------------------");
  console.log(product);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare form data for multipart upload
      const formData = new FormData();

      console.log("-------------------- data --------------------");
      console.log(data);

      const mediaWithoutFiles = data.media.map(({ file, posterFile, ...rest }) => rest);

      const variantsWithValueIds = data.variants.map((variant) => ({
        ...variant,
        optionValueIds: Object.values(variant.options),
      }));

      // Add product data as JSON
      const { variants, ...dataWithoutVariants } = data;

      const productData = {
        ...dataWithoutVariants,
        media: mediaWithoutFiles,
        variants: variantsWithValueIds,
      };

      formData.append("productData", JSON.stringify(productData));

      // Add media files
      data.media.forEach((item: any) => {
        if (item.file) {
          formData.append(`media_${item.sortOrder}`, item.file);
        }
        if (item.posterFile) {
          formData.append(`poster_${item.sortOrder}`, item.posterFile);
        }
      });

      const url = isEditMode ? `/api/products/${product!.id}` : "/api/products";

      const response = isEditMode ? await axios.put(url, formData) : await axios.post(url, formData);

      toast.success(t(isEditMode ? "product updated successfully" : "product created successfully"));

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
          : t(isEditMode ? "failed to update product" : "failed to create product")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  function onError() {
    toast.error(t("please fix the errors in the form before submitting"));
  }

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

  const data = watch();
  console.log("-------------------- data --------------------");
  console.log(data);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mx-auto">
        <div className="max-w-3xl">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <h1 className="font-bold text-2xl">{isEditMode ? t("edit product") : t("create product")}</h1>
                <p className="text-muted-foreground text-sm">
                  {isEditMode ? t("update product information") : t("add a new product to your catalog")}
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
                disabled={isSubmitting || !isDirty}
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
      <div className="mx-auto py-8">
        <div className="max-w-3xl">
          <FormProvider {...form}>
            <form id="product-form" onSubmit={handleSubmit(onSubmit, onError)} className="mb-2">
              {/* Main Content */}
              <div className="space-y-2 lg:col-span-2">
                {/* Basic Information */}
                <BasicInformation
                  setValue={setValue}
                  errors={errors}
                  categories={categories}
                  categoryValue={watch("categoryId")}
                  isActive={watch("isActive")}
                />

                {/* Pricing Section */}
                <PricingSection setValue={setValue} errors={errors} currency={watch("currency")} register={register} />

                {/* Plan Selection */}
                <PlanSelector
                  selectedPlanIds={watch("planIds") || []}
                  onChange={(planIds) => {
                    setValue("planIds", planIds, {
                      shouldDirty: true,
                    });
                  }}
                  error={errors.planIds?.message}
                />

                {/* Multi-language Content */}
                <ProductContentForm
                  value={watch("translations") || []}
                  onChange={(newTranslations) => {
                    setValue("translations", newTranslations, {
                      shouldDirty: true,
                    });
                  }}
                  requiredLanguages={[]}
                />
                {errors.translations && <p className="mt-2 text-destructive text-sm">{errors.translations.message}</p>}

                {/* Media Upload */}
                <MediaUpload
                  value={watch("media") || []}
                  onChange={(newMedia) => {
                    setValue("media", newMedia, {
                      shouldDirty: true,
                    });
                  }}
                  maxFiles={100}
                  maxFileSize={500}
                />

                {/* Product Options */}
                <ProductOptions />

                {/* Variants Preview */}
                <ProductVariants />
              </div>
            </form>
          </FormProvider>
          <ProductSuppliers setValue={setValue} watch={watch} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isEditMode && (
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t("delete product")}
          description={t("are you sure you want to delete this product")}
          alertMessage={t("this action cannot be undone")}
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

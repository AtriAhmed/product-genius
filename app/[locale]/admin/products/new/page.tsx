"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Globe, ImageIcon } from "lucide-react";
import MediaUpload, {
  MediaItem,
} from "@/app/[locale]/admin/products/new/MediaUpload";
import MultiLanguageForm, {
  Translation,
} from "@/app/[locale]/admin/products/new/MultiLanguageForm";
import BasicInformation from "./BasicInformation";
import PricingSection from "./PricingSection";
import StatusSection from "./StatusSection";
import SummarySection from "./SummarySection";

// Form validation schema
const productFormSchema = z.object({
  defaultTitle: z.string().optional(),
  defaultDescription: z.string().optional(),
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      defaultTitle: "",
      defaultDescription: "",
      suggestedPrice: undefined,
      currency: "USD",
      categoryId: undefined,
      isActive: true,
      translations: [],
      media: [],
    },
    mode: "onChange",
  });

  // Update form when translations change
  React.useEffect(() => {
    setValue("translations", translations, { shouldValidate: true });
  }, [translations, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare form data for multipart upload
      const formData = new FormData();

      // Add product data as JSON
      const productData = {
        ...data,
        translations,
        media: media
          .filter((item) => item.url && !item.file)
          .map((item) => ({
            url: item.url,
            type: item.type,
            sortOrder: item.sortOrder,
          })),
      };

      formData.append("productData", JSON.stringify(productData));

      // Add media files
      media.forEach((item) => {
        if (item.file) {
          formData.append(`media_${item.sortOrder}`, item.file);
        }
      });

      const response = await fetch("/api/products/create", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      router.push(`/admin/products/${result.product.id}`);
    } catch (error) {
      console.error("Product creation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (
      window.confirm(
        "Are you sure you want to leave? Your changes will be lost."
      )
    ) {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Product</h1>
                <p className="text-sm text-muted-foreground">
                  Add a new product to your catalog
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isValid ? "default" : "secondary"}>
                {isValid ? "Ready to save" : "Incomplete"}
              </Badge>
              <Button
                type="submit"
                form="product-form"
                disabled={!isValid || isSubmitting}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Creating..." : "Create Product"}
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
              <BasicInformation register={register} errors={errors} />

              {/* Multi-language Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Product Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add product information in multiple languages
                  </p>
                </CardHeader>
                <CardContent>
                  <MultiLanguageForm
                    value={translations}
                    onChange={setTranslations}
                    requiredLanguages={["en"]}
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
                    Product Media
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload images and videos for your product
                  </p>
                </CardHeader>
                <CardContent>
                  <MediaUpload
                    value={media}
                    onChange={setMedia}
                    maxFiles={10}
                    maxFileSize={50}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <PricingSection register={register} watch={watch} />

              {/* Status */}
              <StatusSection register={register} />

              {/* Summary */}
              <SummarySection
                translations={translations}
                media={media}
                isValid={isValid}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

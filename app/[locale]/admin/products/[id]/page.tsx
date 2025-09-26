"use client";

import MediaUpload, {
  MediaItem,
} from "@/app/[locale]/admin/products/_components/MediaUpload";
import MultiLanguageForm, {
  Translation,
} from "@/app/[locale]/admin/products/_components/ProductContentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Globe, ImageIcon, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import BasicInformation from "@/app/[locale]/admin/products/_components/BasicInformation";
import PricingSection from "@/app/[locale]/admin/products/_components/PricingSection";
import StatusSection from "@/app/[locale]/admin/products/_components/StatusSection";

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

interface Product {
  id: number;
  suggestedPrice?: number;
  currency?: string;
  categoryId?: number;
  isActive: boolean;
  translations: {
    locale: string;
    title: string;
    description: string;
  }[];
  media: {
    id: number;
    url: string;
    type: "IMAGE" | "VIDEO";
    sortOrder: number;
  }[];
  category?: {
    id: number;
    translations: {
      locale: string;
      title: string;
    }[];
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams<{ id: string }>();

  const productId = parseInt(params.id);

  // Fetch product data and categories
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch product and categories in parallel
        const [productResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch("/api/categories"),
        ]);

        if (!productResponse.ok) {
          throw new Error("Product not found");
        }

        const productData = await productResponse.json();
        const categoriesData = await categoriesResponse.json();

        setProduct(productData.product);
        setCategories(categoriesData.categories || []);

        // Convert product data to form state
        const productTranslations = productData.product.translations.map(
          (t: any) => ({
            locale: t.locale,
            title: t.title,
            description: t.description,
          })
        );

        const productMedia = productData.product.media.map((m: any) => ({
          id: `existing-${m.id}`,
          url: m.url,
          type: m.type,
          sortOrder: m.sortOrder,
          preview: m.url,
        }));

        setTranslations(productTranslations);
        setMedia(productMedia);

        // Set form default values
        setValue("suggestedPrice", productData.product.suggestedPrice);
        setValue("currency", productData.product.currency || "USD");
        setValue("categoryId", productData.product.categoryId);
        setValue("isActive", productData.product.isActive);
        setValue("translations", productTranslations);
        setValue("media", productMedia);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product data");
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    if (productId && !isNaN(productId)) {
      fetchData();
    }
  }, [productId, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
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
  useEffect(() => {
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

      // Add new media files
      media.forEach((item) => {
        if (item.file) {
          formData.append(`media_${item.sortOrder}`, item.file);
        }
      });

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Product update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Product deletion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={goBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <p className="text-sm text-muted-foreground">
                  Modify product details and settings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isValid ? "default" : "secondary"}>
                {isValid ? "Ready to save" : "Incomplete"}
              </Badge>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={!isValid || isSubmitting}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
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
                register={register}
                control={control}
                errors={errors}
                categories={categories}
                defaultValue={product.categoryId}
              />

              {/* Multi-language Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Product Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Edit product information in multiple languages
                  </p>
                </CardHeader>
                <CardContent>
                  <MultiLanguageForm
                    value={translations}
                    onChange={setTranslations}
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
                    Product Media
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage images and videos for your product
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
              <PricingSection
                register={register}
                watch={watch}
                defaultPrice={product.suggestedPrice}
                defaultCurrency={product.currency}
              />

              {/* Status */}
              <StatusSection
                register={register}
                defaultValue={product.isActive}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";
import { getCurrentTranslation } from "@/lib/products";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageGallery } from "./ImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductSkeleton } from "./ProductSkeleton";
import { ProductSuppliers } from "./ProductSuppliers";
import { Product, User } from "@/types";
import axios from "axios";
import useSWR from "swr";

async function fetcher(id: string) {
  const response = await axios.get(`/api/products/${id}`);
  return response.data;
}

async function userFetcher(): Promise<User> {
  const response = await axios.get("/api/users/current");
  return response.data;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("products");
  const { setBreadcrumbs, resetBreadcrumbs, createProductBreadcrumbs } = useBreadcrumb();
  const [isLiked, setIsLiked] = useState(false);

  const productId = params.id as string;

  const {
    data: product,
    error,
    isLoading,
  } = useSWR<Product>(["product", productId], () => fetcher(productId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
  } = useSWR<User>("current-user", userFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const scrollToProviders = () => {
    const element = document.getElementById("all-providers");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  function updateBreadcrumbs() {
    if (product) {
      const translation = getCurrentTranslation(product.translations || []);
      const categoryTranslation = getCurrentTranslation(product.category?.translations || []);
      const breadcrumbs = createProductBreadcrumbs(
        translation?.title || "Product",
        categoryTranslation?.title,
        product.id,
        product.category?.id
      );
      setBreadcrumbs(breadcrumbs);
    }
  }

  useEffect(() => {
    if (productId) {
      updateBreadcrumbs();
    }

    // Clean up breadcrumbs when component unmounts
    return () => {
      resetBreadcrumbs();
    };
  }, [product]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = async () => {
    const translation = getCurrentTranslation(product?.translations || []);
    if (navigator.share) {
      try {
        await navigator.share({
          title: translation?.title || "Product",
          text: translation?.description || "",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-0 sm:px-4 container">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/products")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to products
            </Button>
          </div>
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const translation = getCurrentTranslation(product?.translations || []);
  const categoryTranslation = getCurrentTranslation(product?.category?.translations || []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to products
          </Button>
        </div>

        {/* Product Content */}
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column - Images */}
          <div>
            <ImageGallery media={product?.media || []} />
          </div>

          {/* Right Column - Product Info */}
          <div>
            <ProductInfo
              product={product}
              user={user as User}
              translation={translation}
              categoryTranslation={categoryTranslation}
              isLiked={isLiked}
              onLike={handleLike}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

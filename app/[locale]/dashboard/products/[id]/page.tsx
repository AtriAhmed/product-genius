"use client";

import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/contexts/BreadcrumbProvider";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AllProviders } from "./AllProviders";
import { ImageGallery } from "./ImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductSkeleton } from "./ProductSkeleton";
import { ProvidersPreview } from "./ProvidersPreview";
import { Marketplace, Product, ProductTranslation, Supplier } from "./types";

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("products");
  const { setBreadcrumbs, resetBreadcrumbs, createProductBreadcrumbs } =
    useBreadcrumb();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const productId = params.id as string;

  // Mock data for suppliers and marketplaces
  const mockSuppliers: Supplier[] = [
    {
      id: 1,
      name: "TechSupply Co",
      price: 299,
      currency: "$",
      rating: 4.8,
      deliveryTime: "2-3 days",
    },
    {
      id: 2,
      name: "Global Vendors",
      price: 285,
      currency: "$",
      rating: 4.5,
      deliveryTime: "3-5 days",
    },
    {
      id: 3,
      name: "Quick Parts",
      price: 310,
      currency: "$",
      rating: 4.9,
      deliveryTime: "1-2 days",
    },
    {
      id: 4,
      name: "Bulk Suppliers",
      price: 275,
      currency: "$",
      rating: 4.3,
      deliveryTime: "5-7 days",
    },
    {
      id: 5,
      name: "Premium Parts",
      price: 320,
      currency: "$",
      rating: 4.7,
      deliveryTime: "2-4 days",
    },
  ];

  const mockMarketplaces: Marketplace[] = [
    {
      id: 1,
      name: "Amazon",
      price: 325,
      currency: "$",
      url: "https://amazon.com",
      rating: 4.6,
    },
    {
      id: 2,
      name: "eBay",
      price: 295,
      currency: "$",
      url: "https://ebay.com",
      rating: 4.4,
    },
    {
      id: 3,
      name: "Shopify Store",
      price: 315,
      currency: "$",
      url: "https://example-store.com",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Etsy",
      price: 340,
      currency: "$",
      url: "https://etsy.com",
      rating: 4.8,
    },
  ];

  const scrollToProviders = () => {
    const element = document.getElementById("all-providers");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentTranslation = (
    translations: ProductTranslation[],
    locale = "en"
  ) => {
    return (
      translations.find((t) => t.locale === locale) || translations[0] || null
    );
  };

  // Fetch product
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product); // The API returns { product: ... }

        // Set up dynamic breadcrumbs
        const product = data.product;
        const translation = getCurrentTranslation(product.translations || []);
        const categoryTranslation = getCurrentTranslation(
          product.category?.translations || []
        );

        const breadcrumbs = createProductBreadcrumbs(
          translation?.title || "Product",
          categoryTranslation?.title,
          product.id,
          product.category?.id
        );

        setBreadcrumbs(breadcrumbs);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      router.push("/dashboard/products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }

    // Clean up breadcrumbs when component unmounts
    return () => {
      resetBreadcrumbs();
    };
  }, [productId]);

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
        <div className="container mx-auto px-0 sm:px-4">
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/products")}
            >
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

  const translation = getCurrentTranslation(product.translations);
  const categoryTranslation =
    product.category?.translations?.find((t) => t.locale === "en") ||
    product.category?.translations?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-0 sm:px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/products")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to products
          </Button>
        </div>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <ImageGallery media={product.media} />
          </div>

          {/* Right Column - Product Info */}
          <div>
            <ProductInfo
              product={product}
              translation={translation}
              categoryTranslation={categoryTranslation}
              isLiked={isLiked}
              onLike={handleLike}
              onShare={handleShare}
            />

            <ProvidersPreview
              suppliers={mockSuppliers}
              marketplaces={mockMarketplaces}
              onScrollToProviders={scrollToProviders}
            />
          </div>
        </div>

        {/* All Providers Section */}
        <AllProviders
          suppliers={mockSuppliers}
          marketplaces={mockMarketplaces}
        />
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentTranslation } from "@/lib/products";
import {
  formatPrice,
  formatPriceCents,
  getInternalSupplierPrice,
  getMediaUrl,
} from "@/lib/utils";
import { Product, ProductTranslation } from "@/types";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ShopifyIcon from "@/assets/images/shopify.svg";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

const currencyMap = Object.fromEntries(
  currencies.map((currency) => [currency.code, currency])
);

// Product Card Component
export default function ProductCard({
  product,
  onView,
}: {
  product: Product;
  onView: (product: Product) => void;
}) {
  const t = useTranslations("products");
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const translation = getCurrentTranslation(product?.translations || []);
  const mainMedia = product?.media?.[0];

  // Handle video play/pause on hover
  useEffect(() => {
    const video = videoRef.current;
    if (video && mainMedia?.type === "VIDEO") {
      if (isVideoHovered) {
        video.play().catch(() => {
          // Handle play error silently
        });
      } else {
        video.pause();
        // video.currentTime = 0;
      }
    }
  }, [isVideoHovered, mainMedia?.type]);
  const categoryTranslation = getCurrentTranslation(
    product?.category?.translations || []
  );

  const isImported = (product.productMappings || []).length > 0;

  return (
    <Card
      className="group flex flex-col gap-2 overflow-hidden pt-0 pb-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="relative h-[200px] overflow-hidden bg-gray-100">
        {isImported && (
          <div
            className="top-3 right-3 z-20 absolute flex items-center gap-2 px-2.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm select-none"
            // Make sure it doesn't block card click — pointer-events none so click passes through
            style={{ background: "rgba(15, 185, 100, 0.95)" }}
            aria-hidden
          >
            <div className="w-4 h-4">
              <ShopifyIcon className="text-white" height={15} />
            </div>
            <span className="font-semibold text-[12px] text-white">
              {t("imported") || "Imported"}
            </span>
          </div>
        )}

        {mainMedia ? (
          mainMedia?.type === "IMAGE" ? (
            <Image
              src={getMediaUrl(mainMedia.url)}
              alt={translation?.title || "Product"}
              fill
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="relative w-full h-full"
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseLeave={() => setIsVideoHovered(false)}
            >
              <video
                ref={videoRef}
                src={getMediaUrl(mainMedia.url)}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
              {/* Video Poster Overlay */}
              {mainMedia.poster && (
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isVideoHovered ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <Image
                    src={getMediaUrl(mainMedia.poster)}
                    alt={translation?.title || "Video thumbnail"}
                    fill
                    className="w-full h-full object-cover"
                  />
                  {/* Video Play Button Overlay */}
                  <div className="absolute inset-0 flex justify-center items-center bg-black/20 hover:bg-black/30 transition-colors duration-300">
                    <div className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-300">
                      <Play className="w-6 h-6 ml-0.5 fill-white text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex justify-center items-center w-full h-full bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <CardContent className="grow p-4 pt-0">
        <div className="flex flex-col space-y-2 h-full">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold group-hover:text-primary text-lg line-clamp-2 transition-colors">
              {translation?.title || "Untitled"}
            </h3>
          </div>

          {categoryTranslation?.title && (
            <Badge
              variant="secondary"
              className="!bg-yellow-500 text-white text-xs"
            >
              {categoryTranslation.title}
            </Badge>
          )}

          <p className="text-muted-foreground text-sm line-clamp-3">
            {translation?.description}
          </p>

          <div className="flex flex-wrap justify-between items-center gap-2 mt-auto ml-auto">
            {product?.price && (
              <Badge className="px-3 py-1 border-0 bg-gradient-to-r from-primary-700 to-primary-500 font-semibold text-white text-sm transition-all duration-300 transform">
                {formatPrice(product.price, product.currency || "USD")}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

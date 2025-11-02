"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMediaUrl } from "@/lib/utils";
import { Product, ProductTranslation } from "@/types";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  const getCurrentTranslation = (
    translations: ProductTranslation[],
    locale = "en"
  ) => {
    return (
      translations.find((t) => t.locale === locale) || translations[0] || null
    );
  };

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
  const categoryTranslation =
    product.category?.translations?.find((t) => t.locale === "en") ||
    product.category?.translations?.[0];

  return (
    <Card
      className="group gap-2 overflow-hidden pt-0 pb-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="relative h-[200px] overflow-hidden bg-gray-100">
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

      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold group-hover:text-primary text-lg line-clamp-2 transition-colors">
              {translation?.title || "Untitled"}
            </h3>
          </div>

          {categoryTranslation && (
            <Badge variant="secondary" className="text-xs">
              {categoryTranslation.title}
            </Badge>
          )}

          <p className="text-muted-foreground text-sm line-clamp-3">
            {translation?.description}
          </p>

          <div className="flex flex-wrap justify-between items-center gap-2">
            {product.sellingPrice && (
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary text-lg">
                  {currencyMap[product.currency!]?.symbol || product.currency}
                  {product.sellingPrice}
                </span>
              </div>
            )}
            <span className="ms-auto px-2 py-1 rounded-sm bg-primary-500 hover:bg-primary-500/90 font-medium text-[11px] text-white">
              {t("view supplier")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

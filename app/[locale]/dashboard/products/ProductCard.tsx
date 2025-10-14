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
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden pt-0 pb-2 gap-2"
      onClick={() => onView(product)}
    >
      <div className="h-[200px] relative overflow-hidden bg-gray-100">
        {mainMedia ? (
          mainMedia?.type === "IMAGE" ? (
            <Image
              src={getMediaUrl(mainMedia.url)}
              alt={translation?.title || "Product"}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
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
                    className="object-cover w-full h-full"
                  />
                  {/* Video Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-300">
                    <div className="bg-black/60 rounded-full p-3 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {translation?.title || "Untitled"}
            </h3>
          </div>

          {categoryTranslation && (
            <Badge variant="secondary" className="text-xs">
              {categoryTranslation.title}
            </Badge>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3">
            {translation?.description}
          </p>

          <div className="flex justify-between items-center flex-wrap gap-2">
            {product.suggestedPrice && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {currencyMap[product.currency!]?.symbol || product.currency}
                  {product.suggestedPrice}
                </span>
              </div>
            )}
            <span className="ms-auto px-2 py-1 rounded-sm bg-primary-500 hover:bg-primary-500/90 text-white text-[11px] font-medium">
              {t("view supplier")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

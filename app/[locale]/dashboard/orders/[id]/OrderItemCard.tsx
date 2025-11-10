"use client";

import { Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderItem } from "@/types";
import { getMediaUrl, htmlToText, hueFromString } from "@/lib/utils";
import { useTranslations } from "next-intl";

type OrderItemCardProps = {
  item: OrderItem;
  currency?: string;
};

const formatCurrency = (cents: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
};

export default function OrderItemCard({ item, currency = "USD" }: OrderItemCardProps) {
  const t = useTranslations("orders");

  return (
    <div className="flex items-center gap-4 px-4 py-2 border rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.imageUrl ? (
          <Avatar className="w-16 h-16 rounded-md">
            <AvatarImage
              src={getMediaUrl(item.imageUrl)}
              alt={item?.productTitle || item.title}
              className="object-cover"
            />
            <AvatarFallback>
              <Package className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex justify-center items-center w-16 h-16 rounded-md bg-muted">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground text-sm truncate">
          {item.productTitle || item.title || t("unknown product")}
        </h4>
        {item.productDescription && (
          <p className="text-muted-foreground text-xs line-clamp-2">
            {htmlToText(item.productDescription)?.replace(/^product description:/i, "")}
          </p>
        )}

        {/* Product Options */}
        {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Object.entries(item.variantOptions).map(([key, value]) => {
              const hue = hueFromString(`${key}-${value}`);
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 border rounded-md font-semibold text-[10px]"
                  style={{
                    backgroundColor: `hsl(${hue}, 60%, 95%)`,
                    borderColor: `hsl(${hue}, 60%, 80%)`,
                    color: `hsl(${hue}, 60%, 30%)`,
                  }}
                >
                  <span style={{ color: `hsl(${hue}, 40%, 50%)` }}>{key}:</span>
                  <span className="ml-1">{value as string}</span>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mt-1 text-xs">
          <span className="text-muted-foreground">
            Qty: <span className="font-medium">{item.quantity}</span>
          </span>
          {item.unitPriceCents && (
            <span className="text-muted-foreground">
              Unit Price: <span className="font-medium">{formatCurrency(item.unitPriceCents, currency)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        {item.unitPriceCents && item.quantity && (
          <p className="font-semibold text-foreground">
            {formatCurrency(item.unitPriceCents * item.quantity, currency)}
          </p>
        )}
      </div>
    </div>
  );
}

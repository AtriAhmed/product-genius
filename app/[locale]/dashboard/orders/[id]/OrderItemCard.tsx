"use client";

import { Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderItem } from "@/types";

type OrderItemCardProps = {
  item: OrderItem;
  currency?: string;
  t: (key: string) => string;
};

const formatCurrency = (cents: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
};

export default function OrderItemCard({
  item,
  currency = "USD",
  t,
}: OrderItemCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.product?.media?.[0]?.url ? (
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={item.product.media[0].url}
              alt={item.product?.translations?.[0]?.title || item.title}
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
        <h4 className="font-medium text-foreground truncate">
          {item.product?.translations?.[0]?.title ||
            item.title ||
            t("unknown product")}
        </h4>
        {item.product?.translations?.[0]?.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {item.product.translations[0].description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-muted-foreground text-sm">
            Qty: <span className="font-medium">{item.quantity}</span>
          </span>
          {item.unitPriceCents && (
            <span className="text-muted-foreground text-sm">
              Unit Price:{" "}
              <span className="font-medium">
                {formatCurrency(item.unitPriceCents, currency)}
              </span>
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

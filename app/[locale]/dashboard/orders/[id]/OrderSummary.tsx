"use client";

import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";

type OrderSummaryProps = {
  order: Order;
  t: (key: string) => string;
};

const formatCurrency = (cents: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
};

export default function OrderSummary({ order, t }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("order summary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.items && order.items.length > 0 ? (
          <>
            {/* Individual Items */}
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">
                      {item.productTitle || item.title || t("unknown product")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity} ×{" "}
                      {item.unitPriceCents ? formatCurrency(item.unitPriceCents, order.currency) : t("n/a")}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    {item.unitPriceCents && item.quantity ? (
                      <p className="font-medium">
                        {formatCurrency(item.unitPriceCents * item.quantity, order.currency)}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">{t("n/a")}</p>
                    )}
                    {item.shippingCents && item.shippingCents > 0 && (
                      <p className="text-muted-foreground text-xs">
                        + {formatCurrency(item.shippingCents, order.currency)} shipping
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">{t("no items found")}</p>
            <Separator />
          </>
        )}

        <div className="flex justify-between font-semibold">
          <span>{t("total")}</span>
          <span>{order.totalCents ? formatCurrency(order.totalCents, order.currency) : t("n/a")}</span>
        </div>
      </CardContent>
    </Card>
  );
}

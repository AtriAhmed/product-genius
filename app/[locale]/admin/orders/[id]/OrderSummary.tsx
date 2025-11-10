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
        {order.items && order.items.length > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Items ({order.items.length})
              </span>
              <span>
                {order.items.reduce((total, item) => {
                  if (item.unitPriceCents && item.quantity) {
                    return total + item.unitPriceCents * item.quantity;
                  }
                  return total;
                }, 0) > 0
                  ? formatCurrency(
                      order.items.reduce((total, item) => {
                        if (item.unitPriceCents && item.quantity) {
                          return total + item.unitPriceCents * item.quantity;
                        }
                        return total;
                      }, 0),
                      order.currency
                    )
                  : t("n/a")}
              </span>
            </div>
            <Separator />
          </>
        )}

        <div className="flex justify-between font-semibold">
          <span>{t("total")}</span>
          <span>
            {order.totalCents
              ? formatCurrency(order.totalCents, order.currency)
              : t("n/a")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import OrderItemCard from "./OrderItemCard";

type OrderItemsProps = {
  order: Order;
  t: (key: string) => string;
};

export default function OrderItems({ order, t }: OrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {t("order items")}
          {order.items && (
            <Badge variant="secondary" className="ml-auto">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.items && order.items.length > 0 ? (
          <div className="space-y-4">
            {order.items.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                currency={order.currency}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t("no items found")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

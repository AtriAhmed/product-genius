"use client";

import { Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@/types";

type OrderOverviewProps = {
  order: Order;
  t: (key: string) => string;
};

const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "UNPAID":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PAID":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELED":
      return "bg-red-100 text-red-800 border-red-200";
    case "REFUNDED":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatCurrency = (cents: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
};

const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default function OrderOverview({ order, t }: OrderOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Order Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="gap-6 grid md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                {t("order date")}
              </span>
              <span className="font-medium text-sm">
                {order.createdAt ? formatDate(order.createdAt) : t("n/a")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                {t("order status")}
              </span>
              <Badge
                variant="outline"
                className={`${getOrderStatusColor(
                  order.status || "DRAFT"
                )} text-xs`}
              >
                {order.status || "DRAFT"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                {t("currency")}
              </span>
              <span className="font-medium text-sm">
                {order.currency || "USD"}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                {t("total amount")}
              </span>
              <span className="font-semibold text-sm">
                {order.totalCents
                  ? formatCurrency(order.totalCents, order.currency)
                  : t("n/a")}
              </span>
            </div>
            {order.shopifyOrderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Shopify Order ID
                </span>
                <span className="font-mono font-medium text-sm">
                  {order.shopifyOrderId}
                </span>
              </div>
            )}
            {order.agent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Assigned Agent
                </span>
                <span className="font-medium text-sm">
                  {order.agent.name || order.agent.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

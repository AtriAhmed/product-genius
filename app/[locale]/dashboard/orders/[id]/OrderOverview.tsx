"use client";

import { Calendar, ExternalLink, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@/types";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";

type OrderOverviewProps = {
  order: Order;
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

export default function OrderOverview({ order }: OrderOverviewProps) {
  const t = useTranslations("orders");

  console.log("-------------------- order --------------------");
  console.log(order);
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
              <span className="text-muted-foreground text-sm">{t("order date")}</span>
              <span className="font-medium text-sm">{order.createdAt ? formatDate(order.createdAt) : t("n/a")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("order status")}</span>
              <Badge variant="outline" className={`${getOrderStatusColor(order.status || "DRAFT")} text-xs`}>
                {order.status || "DRAFT"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("currency")}</span>
              <span className="font-medium text-sm">{order.currency || "USD"}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("total amount")}</span>
              <span className="font-semibold text-sm">
                {order.totalCents ? formatCurrency(order.totalCents, order.currency) : t("n/a")}
              </span>
            </div>
            {order.shopifyOrderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Shopify Order ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-sm">{order.shopifyOrderId || t("n/a")}</span>
                  {order.shopifyStore?.shop && order?.shopifyOrderId && (
                    <a
                      href={`https://${order.shopifyStore.shop}/admin/orders/${order.shopifyOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
            {order.agent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Assigned Agent</span>
                <span className="font-medium text-sm">{order.agent.name || order.agent.email}</span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t("tracking number")}</span>
                <span className="font-mono font-medium text-sm">{order.trackingNumber}</span>
              </div>
            )}
            {order.trackingUrl && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t("tracking url")}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-[200px] font-medium text-blue-600 hover:text-blue-800 text-sm underline truncate"
                  >
                    {order.trackingUrl}
                  </a>
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

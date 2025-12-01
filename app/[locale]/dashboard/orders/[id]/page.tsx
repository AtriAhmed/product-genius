"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { ArrowLeft, Tag } from "lucide-react";

import { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OrderOverview from "./OrderOverview";
import OrderItems from "./OrderItems";
import CustomerInformation from "./CustomerInformation";
import DeliveryInformation from "./DeliveryInformation";
import OrderSummary from "./OrderSummary";

async function fetcher(orderId: string) {
  const response = await axios.get(`/api/orders/${orderId}`);
  return response.data;
}

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

export default function DashboardOrderDetailsPage() {
  const t = useTranslations("orders");
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const {
    data: order,
    error,
    isLoading,
  } = useSWR<Order>(orderId ? ["order", orderId] : null, () => fetcher(orderId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-6 py-8 container">
          <div className="p-8 border rounded-lg text-center">
            <h2 className="mb-2 font-semibold text-xl">{t("error")}</h2>
            <p className="text-muted-foreground">{t("failed to load order details")}</p>
            <Button onClick={() => router.push("/dashboard/orders")} className="mt-4" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back to orders")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push("/dashboard/orders")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-3xl">{t("order details")}</h1>
              {isLoading ? (
                <Skeleton className="w-48 h-4 mt-2" />
              ) : (
                <p className="mt-2 text-muted-foreground">
                  {t("order number")} #{order?.orderNumber || orderId}
                </p>
              )}
            </div>
          </div>
          {!isLoading && order && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${getOrderStatusColor(order.status || "DRAFT")} font-medium`}>
                <Tag className="w-3 h-3 mr-1" />
                {order.status || "DRAFT"}
              </Badge>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="gap-6 grid lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="p-6 border rounded-lg">
                  <Skeleton className="w-32 h-6 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
                <div className="p-6 border rounded-lg">
                  <Skeleton className="w-32 h-6 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-16" />
                    <Skeleton className="w-full h-16" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <Skeleton className="w-32 h-6 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                </div>
                <div className="p-6 border rounded-lg">
                  <Skeleton className="w-32 h-6 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : order ? (
          <div className="gap-4 grid lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-4 lg:col-span-2">
              <OrderOverview order={order} />
              <OrderItems order={order} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <CustomerInformation order={order} t={t} />
              <DeliveryInformation order={order} t={t} />
              <OrderSummary order={order} t={t} />
            </div>
          </div>
        ) : (
          <div className="p-8 border rounded-lg text-center">
            <h2 className="mb-2 font-semibold text-xl">{t("order not found")}</h2>
            <p className="mb-4 text-muted-foreground">{t("order not found description")}</p>
            <Button onClick={() => router.push("/dashboard/orders")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back to orders")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

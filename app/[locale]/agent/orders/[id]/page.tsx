"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, OrderStatus } from "@/types";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { formatPrice, getMediaUrl } from "@/lib/utils";

async function fetcher(orderId: string) {
  const response = await axios.get(`/api/orders/${orderId}`);
  return response.data;
}

const getShipmentStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "PICKED":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "DELIVERED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "RETURNED":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default function AgentOrderDetailsPage() {
  const t = useTranslations("orders");
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWR<Order>(
    orderId ? ["order", orderId] : null,
    () => fetcher(orderId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  console.log("-------------------- order --------------------");
  console.log(order);

  const handleUpdateShipmentStatus = async (newStatus: string) => {
    if (!order?.id) return;

    setIsUpdating(true);
    try {
      await axios.patch(`/api/orders/${order.id}/shipment`, {
        status: newStatus,
      });
      toast.success("Shipment status updated successfully");
      mutate(); // Refresh the data
    } catch (error) {
      toast.error("Failed to update shipment status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-4 py-2 container">
          <div className="p-8 border rounded-lg text-center">
            <h2 className="mb-2 font-semibold text-xl">{t("error")}</h2>
            <p className="text-muted-foreground">
              {t("failed to load order details")}
            </p>
            <Button
              onClick={() => router.push("/agent/orders")}
              className="mt-4"
              variant="outline"
            >
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
      <div className="mx-auto px-4 py-2 container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/agent/orders")}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back to orders")}
          </Button>
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {t("order details")}
            </h1>
            {isLoading ? (
              <Skeleton className="w-48 h-4 mt-2" />
            ) : (
              <p className="mt-2 text-muted-foreground">
                {t("order number")} #{order?.orderNumber || orderId}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </CardContent>
            </Card>
          </div>
        ) : order ? (
          <div className="gap-6 grid lg:grid-cols-3">
            {/* Order Information */}
            <div className="space-y-6 lg:col-span-2">
              {/* Order Status & Shipment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t("order & shipment status")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t("shipment status")}:</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getShipmentStatusColor(order.status!)}>
                        {t(order.status?.toLowerCase() || "pending")}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={handleUpdateShipmentStatus}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <Truck className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            {t("pending")}
                          </SelectItem>
                          <SelectItem value="PICKED">{t("picked")}</SelectItem>
                          <SelectItem value="IN_TRANSIT">
                            {t("in_transit")}
                          </SelectItem>
                          <SelectItem value="DELIVERED">
                            {t("delivered")}
                          </SelectItem>
                          <SelectItem value="RETURNED">
                            {t("returned")}
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            {t("cancelled")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t("order date")}:</span>
                    <span className="text-muted-foreground">
                      {order.createdAt ? formatDate(order.createdAt) : t("n/a")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("order items")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0 w-16 h-16 overflow-hidden border rounded-lg">
                            {item.product?.media?.[0]?.url ? (
                              <img
                                src={getMediaUrl(
                                  item.product.media[0].type === "IMAGE"
                                    ? item.product.media[0].url
                                    : item.product.media[0].poster
                                )}
                                alt={
                                  item.product.translations?.[0]?.title ||
                                  "Product"
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex justify-center items-center w-full h-full bg-gray-200">
                                <ShoppingCart className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {item.title ||
                                item.product?.translations?.[0]?.title ||
                                t("unknown product")}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {t("quantity")}: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(
                                item.unitPriceCents || 0,
                                order.currency
                              )}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {t("total")}:{" "}
                              {formatPrice(
                                (item.unitPriceCents || 0) *
                                  (item.quantity || 1),
                                order.currency
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>{t("order total")}:</span>
                        <span>
                          {formatPrice(order.totalCents || 0, order.currency)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("no items found")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer & Delivery Information */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("customer information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">{t("name")}:</span>
                    <p className="text-muted-foreground">
                      {order.user?.name || t("n/a")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">{t("email")}:</span>
                    <p className="text-muted-foreground">
                      {order.user?.email || t("n/a")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">{t("phone")}:</span>
                    <p className="text-muted-foreground">
                      {order.deliveryPhone || t("n/a")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t("delivery address")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">
                    {order.deliveryName || t("n/a")}
                  </p>
                  <p className="text-muted-foreground">
                    {order.deliveryAddress1 || t("n/a")}
                  </p>
                  {order.deliveryAddress2 && (
                    <p className="text-muted-foreground">
                      {order.deliveryAddress2}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {order.deliveryCity && order.deliveryState
                      ? `${order.deliveryCity}, ${order.deliveryState} ${
                          order.deliveryZip || ""
                        }`
                      : t("n/a")}
                  </p>
                  <p className="text-muted-foreground">
                    {order.deliveryCountry || t("n/a")}
                  </p>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t("order summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t("currency")}:</span>
                    <span className="text-muted-foreground">
                      {order.currency || "USD"}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{t("total amount")}:</span>
                    <span>
                      {formatPrice(order.totalCents || 0, order.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="p-8 border rounded-lg text-center">
            <h2 className="mb-2 font-semibold text-xl">
              {t("order not found")}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {t("order not found description")}
            </p>
            <Button
              onClick={() => router.push("/agent/orders")}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back to orders")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

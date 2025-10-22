"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useTranslations } from "next-intl";

type OrderSummaryProps = {
  totalPrice: number;
  cartItemCount: number;
  onProceedToCheckout: () => void;
  isLoading: boolean;
};

export default function OrderSummary({
  totalPrice,
  cartItemCount,
  onProceedToCheckout,
  isLoading,
}: OrderSummaryProps) {
  const t = useTranslations("orders");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="w-24 h-6" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("order summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {t("subtotal")} ({cartItemCount} {t("items")})
            </span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span className="text-green-600">{t("free shipping")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("tax")}</span>
            <span>{t("calculated at checkout")}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-medium text-lg">
            <span>{t("total")}</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <Button onClick={onProceedToCheckout} className="w-full" size="lg">
          <CreditCard className="w-4 h-4 mr-2" />
          {t("proceed to checkout")}
        </Button>

        <p className="text-muted-foreground text-xs text-center">
          {t("secure checkout powered by stripe")}
        </p>
      </CardContent>
    </Card>
  );
}

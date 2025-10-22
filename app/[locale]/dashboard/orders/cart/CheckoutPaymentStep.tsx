import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethod } from "@/types";
import {
  CreditCard,
  Loader2,
  Settings,
  Shield,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  totalPrice: number;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
  onPlaceOrder: () => void;
  loading: boolean;
  loadingCards: boolean;
  onNavigateToBilling: () => void;
};

export default function CheckoutPaymentStep({
  totalPrice,
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onPlaceOrder,
  loading,
  loadingCards,
  onNavigateToBilling,
}: Props) {
  const t = useTranslations("orders");
  const tPricing = useTranslations("pricing");

  if (loadingCards) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white/80 dark:bg-neutral-800/80">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-6 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-4 h-4 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800">
          <CreditCard className="w-8 h-8 text-neutral-400" />
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
            {tPricing("no payment methods found")}
          </h3>
          <p className="mb-4 text-neutral-600 dark:text-neutral-400 text-sm">
            {tPricing("add a payment method to continue")}
          </p>
          <Button
            onClick={onNavigateToBilling}
            variant="outline"
            className="border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950"
          >
            <Settings className="w-4 h-4 mr-2" />
            {tPricing("go to billing settings")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 font-semibold text-primary-700 dark:text-primary-300 text-sm">
          <Shield className="w-4 h-4" />
          {tPricing("choose how you'd like to pay")}
        </h3>

        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "border-2 bg-white/80 dark:bg-neutral-800/80 hover:shadow-lg backdrop-blur-sm transition-all cursor-pointer",
              selectedPaymentMethod === method.id
                ? "border-primary-400 dark:border-primary-600 bg-primary-50/80 dark:bg-primary-950/50 shadow-lg"
                : "border-primary-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700"
            )}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/* Card Brand Icon */}
                  <div className="flex justify-center items-center w-10 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 font-bold text-white text-xs">
                    {method.card?.brand.toUpperCase() || "CARD"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                        •••• {method.card?.last4 || "****"}
                      </span>
                      {method.isDefault && (
                        <Badge className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs">
                          {tPricing("default")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                      {tPricing("expires")}{" "}
                      {method.card?.expMonth.toString().padStart(2, "0")}/
                      {method.card?.expYear}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex justify-center items-center w-4 h-4 border-2 rounded-full transition-all",
                    selectedPaymentMethod === method.id
                      ? "border-primary-600 dark:border-primary-400 bg-primary-600 dark:bg-primary-400"
                      : "border-neutral-300 dark:border-neutral-600"
                  )}
                >
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle className="w-3 h-3 fill-current text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Summary */}
      <Card className="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50 dark:from-primary-950 to-primary-100 dark:to-primary-900">
        <CardContent className="p-4">
          <h3 className="mb-3 font-semibold text-primary-700 dark:text-primary-300 text-sm">
            {tPricing("billing summary")}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">
                {t("total")}
              </span>
              <span className="font-bold text-primary-900 dark:text-primary-100">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={loading || !selectedPaymentMethod}
        className="w-full bg-gradient-to-r from-primary-600 hover:from-primary-700 to-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl text-white hover:scale-[1.02] transition-all duration-200"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {tPricing("processing")}
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {t("place order")} • {formatPrice(totalPrice)}
          </>
        )}
      </Button>

      <p className="text-neutral-600 dark:text-neutral-400 text-xs text-center">
        {t("secure checkout powered by stripe")}
      </p>
    </div>
  );
}

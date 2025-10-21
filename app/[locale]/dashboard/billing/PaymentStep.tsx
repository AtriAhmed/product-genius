import { useTranslations } from "next-intl";
import { Plan, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  CreditCard,
  Sparkles,
  Loader2,
  Shield,
  Link as LinkIcon,
} from "lucide-react";

import Image from "next/image";
import { getCardIconPath } from "@/lib/billingUtils";

type Props = {
  plan: Plan;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
  onSubscribe: () => void;
  loading: boolean;
  loadingCards: boolean;
  onNavigateToBilling: () => void;
};

export default function PaymentStep({
  plan,
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onSubscribe,
  loading,
  loadingCards,
  onNavigateToBilling,
}: Props) {
  const t = useTranslations("pricing");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  if (loadingCards) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 space-y-3 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-xl">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {t("no payment methods found")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t("add a payment method to continue")}
          </p>
        </div>
        <Button
          onClick={onNavigateToBilling}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          {t("go to billing settings")}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="h-0 grow">
        <h4 className="font-bold text-lg mb-4 text-primary-900 dark:text-primary-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          {t("select payment method")}
        </h4>
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <Card
              key={pm.id}
              className={`cursor-pointer transition-all duration-300 border-2 hover:scale-[1.02] active:scale-[0.98] ${
                selectedPaymentMethod === pm.id
                  ? "border-primary-500 bg-gradient-to-r from-primary-50 to-primary-50 dark:border-primary-400 dark:from-primary-950/50 dark:to-primary-950/50 shadow-xl"
                  : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg"
              }`}
              onClick={() => onSelectPaymentMethod(pm.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src={getCardIconPath(pm.card?.brand || "unknown")}
                    alt={pm.card?.brand || "Card"}
                    height={24}
                    width={24}
                    className="object-contain rounded-xs"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold capitalize text-slate-900 dark:text-slate-100">
                        {pm.card?.brand}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono font-semibold">
                        •••• {pm.card?.last4}
                      </span>
                      {pm.isDefault && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold">
                          {t("default")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {t("expires")} {pm.card?.expMonth}/{pm.card?.expYear}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all ${
                      selectedPaymentMethod === pm.id
                        ? "border-primary-500 bg-gradient-to-r from-primary-500 to-primary-500 scale-110 shadow-lg"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selectedPaymentMethod === pm.id && (
                      <Check className="w-4 h-4 text-white font-bold" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button
        onClick={onSubscribe}
        disabled={!selectedPaymentMethod || loading}
        className="w-full bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 hover:from-primary-700 hover:via-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("processing;;;")}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {t("subscribe for")} {formatPrice(plan?.price || 0)}
          </>
        )}
      </Button>
    </div>
  );
}

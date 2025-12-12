import { useTranslations } from "next-intl";
import { Plan, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CreditCard, Sparkles, Loader2, Shield, Link as LinkIcon } from "lucide-react";

import Image from "next/image";
import { getCardIconPath } from "@/lib/billingUtils";
import { formatCurrency } from "@/lib/utils";

type Props = {
  plan: Plan;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
  onSubscribe: () => void;
  loading: boolean;
  loadingCards: boolean;
  onNavigateToBilling: () => void;
  selectedInterval?: string;
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
  selectedInterval,
}: Props) {
  const t = useTranslations("pricing");

  // Get the price for the selected interval
  const selectedPrice = selectedInterval
    ? plan.prices?.find((price) => price.interval === selectedInterval && price.price != null) ||
      plan.prices?.find((price) => price.price != null)
    : plan.prices?.find((price) => price.price != null);

  if (loadingCards) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <Loader2 className="top-1/2 left-1/2 absolute w-6 h-6 text-primary-600 dark:text-primary-400 -translate-x-1/2 -translate-y-1/2 transform" />
        </div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="space-y-3 py-8 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl bg-gradient-to-br from-white dark:from-slate-800 to-slate-100 dark:to-slate-900 text-center">
        <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t("no payment methods found")}</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">{t("add a payment method to continue")}</p>
        </div>
        <Button
          onClick={onNavigateToBilling}
          className="bg-gradient-to-r from-primary-600 hover:from-primary-700 to-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl text-white transition-all"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          {t("go to billing settings")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow space-y-4">
      <div className="grow h-0">
        <h4 className="flex items-center gap-2 mb-4 font-bold text-primary-900 dark:text-primary-100 text-lg">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{pm.card?.brand}</span>
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
                        •••• {pm.card?.last4}
                      </span>
                      {pm.isDefault && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 font-semibold text-white text-xs">
                          {t("default")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 font-medium text-slate-500 dark:text-slate-400 text-sm">
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
                    {selectedPaymentMethod === pm.id && <Check className="w-4 h-4 font-bold text-white" />}
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
        className="w-full py-5 rounded-xl bg-gradient-to-r from-primary-600 hover:from-primary-700 disabled:from-slate-400 via-primary-600 hover:via-primary-700 to-primary-700 hover:to-primary-800 disabled:to-slate-500 shadow-xl hover:shadow-2xl font-bold text-white hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("processing;;;")}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {t("subscribe for")} {formatCurrency(selectedPrice?.price || 0)}
          </>
        )}
      </Button>
    </div>
  );
}

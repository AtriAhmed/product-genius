import { useTranslations } from "next-intl";
import { Plan } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Sparkles, Zap, Star } from "lucide-react";

type Props = {
  plan: Plan;
  onNext: () => void;
};

export default function ReviewStep({ plan, onNext }: Props) {
  const t = useTranslations("pricing");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Plan Card */}
      <Card className="h-0 grow flex flex-col border-2 border-primary-300 dark:border-primary-600 bg-gradient-to-br from-white via-primary-50 to-primary-100 dark:from-neutral-800 dark:via-primary-900/30 dark:to-primary-900/30 shadow-xl group hover:shadow-2xl transition-all duration-300 overflow-y-auto">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
        <CardContent className="p-4 space-y-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary-900 dark:text-primary-100">
                {plan.name}
                {plan.mostPopular && (
                  <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-400 animate-pulse" />
                )}
              </h3>
              {plan.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {plan.description}
                </p>
              )}
            </div>
            <div className="text-right bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-3 py-2 rounded-xl shadow-lg">
              <div className="text-xl font-black">
                {formatPrice(plan.price)}
              </div>
              <div className="text-xs font-semibold opacity-90">
                / {t(plan.interval?.toLowerCase())}
              </div>
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-primary-300 to-transparent dark:via-primary-600" />

          {/* Plan Features */}
          {plan.features && plan.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-primary-900 dark:text-primary-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                {t("what's included")}:
              </h4>
              <div className="space-y-1.5">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-xs bg-white/50 dark:bg-neutral-800/50 p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Check className="w-3 h-3 text-white font-bold" />
                    </div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {feature.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card className="border-2 border-primary-200 dark:border-primary-700 bg-gradient-to-br from-white to-primary-50 dark:from-neutral-800 dark:to-primary-950/30 shadow-lg">
        <CardContent className="p-3 space-y-2">
          <h4 className="font-bold text-sm text-primary-900 dark:text-primary-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            {t("billing summary")}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
              <span>
                {t("plan")}: {plan.name}
              </span>
              <span>{formatPrice(plan.price)}</span>
            </div>
            <Separator className="bg-gradient-to-r from-transparent via-primary-300 to-transparent dark:via-primary-600" />
            <div className="flex justify-between font-bold text-sm bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
              <span>{t("total due today")}</span>
              <span className="text-base">{formatPrice(plan.price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 hover:from-primary-700 hover:via-primary-700 hover:to-primary-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t("continue to payment")}
      </Button>
    </div>
  );
}

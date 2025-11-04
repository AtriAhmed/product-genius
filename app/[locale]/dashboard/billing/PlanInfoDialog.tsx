"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles, Crown, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Plan, PlanFeature } from "@/types";

type PlanInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  subscriptionInterval?: string;
};

export default function PlanInfoDialog({
  open,
  onOpenChange,
  plan,
  subscriptionInterval,
}: PlanInfoDialogProps) {
  const t = useTranslations("pricing");

  // Get the price for the subscription interval, fallback to first available price
  const selectedPrice = subscriptionInterval
    ? plan.prices?.find(
        (price) =>
          price.interval === subscriptionInterval && price.price != null
      ) || plan.prices?.find((price) => price.price != null)
    : plan.prices?.find((price) => price.price != null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Plan Details
          </DialogTitle>
        </DialogHeader>

        {/* Animated gradient background for popular plans */}
        {plan.mostPopular && (
          <>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-400/10 via-primary-500/5 to-primary-600/10" />
            <div className="-top-1 -right-1 absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-20 blur-3xl" />
          </>
        )}

        {plan.mostPopular && (
          <div className="-top-4 left-1/2 z-10 absolute -translate-x-1/2">
            <Badge className="flex items-center px-4 py-2 border-2 border-white dark:border-gray-800 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg backdrop-blur-sm text-white">
              <Crown className="w-4 h-4 mr-2 fill-yellow-300 text-yellow-100" />
              <span className="font-semibold">{t("popular")}</span>
              <Sparkles className="w-4 h-4 ml-2 text-yellow-200" />
            </Badge>
          </div>
        )}

        <CardHeader className="z-10 relative space-y-2 text-center">
          <CardTitle className="font-bold text-foreground text-xl">
            {plan.name}
          </CardTitle>

          <div className="flex justify-center items-baseline gap-2">
            {selectedPrice?.compareAtPrice && (
              <span className="font-medium text-muted-foreground text-sm sm:text-lg line-through">
                {formatPrice(selectedPrice.compareAtPrice)}
              </span>
            )}
            <div className="flex items-baseline">
              <span className="bg-clip-text bg-gradient-to-r from-primary-600 dark:from-primary-400 via-primary-700 dark:via-primary-500 to-primary-800 dark:to-primary-600 font-black text-transparent text-2xl sm:text-3xl">
                {formatPrice(selectedPrice?.price || 0)}
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
            <p className="px-2 py-1 rounded-full bg-muted/50 font-semibold text-muted-foreground text-xs capitalize">
              / {t(selectedPrice?.interval?.toLowerCase() || "")}
            </p>
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
          </div>

          {plan.description && (
            <CardDescription className="max-w-sm mx-auto mt-2 text-muted-foreground text-sm leading-relaxed">
              {plan.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="z-10 relative flex-1 pt-0">
          {plan.features && plan.features.length > 0 && (
            <div className="py-4 rounded-xl bg-muted/20 dark:bg-muted/10">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="group/feature flex items-start space-x-3"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        feature.included
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-800/30"
                          : "bg-muted border-2 border-muted-foreground/30"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 transition-all duration-300 ${
                          feature.included
                            ? "text-white"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <span
                        className={`text-xs font-medium leading-relaxed transition-colors duration-300 ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.description}
                      </span>
                      {feature.note && (
                        <p className="mt-1 text-muted-foreground text-xs italic">
                          {feature.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}

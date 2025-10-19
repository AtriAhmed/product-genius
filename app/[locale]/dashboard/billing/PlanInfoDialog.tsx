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
};

export default function PlanInfoDialog({
  open,
  onOpenChange,
  plan,
}: PlanInfoDialogProps) {
  const t = useTranslations("pricing");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto gap-0">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Plan Details
          </DialogTitle>
        </DialogHeader>

        {/* Animated gradient background for popular plans */}
        {plan.mostPopular && (
          <>
            <div className="rounded-3xl absolute inset-0 bg-gradient-to-r from-primary-400/10 via-primary-500/5 to-primary-600/10" />
            <div className="absolute -top-1 -right-1 w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl opacity-20" />
          </>
        )}

        {plan.mostPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 flex items-center backdrop-blur-sm">
              <Crown className="w-4 h-4 mr-2 fill-yellow-300 text-yellow-100" />
              <span className="font-semibold">{t("popular")}</span>
              <Sparkles className="w-4 h-4 ml-2 text-yellow-200" />
            </Badge>
          </div>
        )}

        <CardHeader className="text-center space-y-2 relative z-10">
          <CardTitle className="text-xl font-bold text-foreground">
            {plan.name}
          </CardTitle>

          <div className="flex items-baseline justify-center gap-2">
            {plan.oldPrice && (
              <span className="text-muted-foreground line-through text-sm sm:text-lg font-medium">
                {formatPrice(plan.oldPrice)}
              </span>
            )}
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 bg-clip-text text-transparent">
                {formatPrice(plan.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
            <p className="text-xs text-muted-foreground font-semibold px-2 py-1 bg-muted/50 rounded-full capitalize">
              / {t(plan.interval?.toLowerCase())}
            </p>
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
          </div>

          {plan.description && (
            <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
              {plan.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-0 flex-1 relative z-10">
          {plan.features && plan.features.length > 0 && (
            <div className="bg-muted/20 dark:bg-muted/10 rounded-xl py-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 group/feature"
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
                        <p className="text-xs text-muted-foreground mt-1 italic">
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

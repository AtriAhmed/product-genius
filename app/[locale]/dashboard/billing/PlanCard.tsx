"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan, PlanFeature, User } from "@/types";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SubscriptionDialog from "./SubscriptionDialog";
import { formatCurrency } from "@/lib/utils";

type Props = {
  plan: Plan;
  user?: User;
  onSelect?: (plan: Plan) => void;
  selectedInterval?: string;
};

export default function PlanCard({ plan, user, onSelect, selectedInterval }: Props) {
  const t = useTranslations("pricing");
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  console.log("-------------------- user --------------------");
  console.log(user);
  const hasActiveSubscription = !!user?.currentSubscription;
  const isCurrentPlan = user?.currentSubscription?.plan?.id === plan.id;
  const isFreePlan = plan?.isFree;

  // Get the price for the selected interval, fallback to first available price
  const selectedPrice = selectedInterval
    ? plan.prices?.find((price) => price.interval === selectedInterval) ||
      plan.prices?.find((price) => price.price != null)
    : plan.prices?.find((price) => price.price != null);

  const handleSelectPlan = () => {
    if (hasActiveSubscription) return;

    if (onSelect) {
      onSelect(plan);
    } else {
      setShowSubscriptionDialog(true);
    }
  };

  return (
    <Card
      className={`relative flex flex-col justify-between transition-all mx-auto w-full max-w-[400px] duration-500 rounded-2xl border-2 shadow-lg hover:shadow-2xl hover:-translate-y-2 group
        ${
          plan.mostPopular
            ? "border-gradient-to-r from-primary-400 to-primary-600 bg-gradient-to-br via-white  dark:from-primary-950/50 dark:via-card dark:to-primary-950/30 shadow-primary-200/50 dark:shadow-primary-800/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gradient-to-br hover:from-primary-50/30 hover:to-white dark:hover:from-primary-950/20 dark:hover:to-card"
        }`}
    >
      {/* Animated gradient background for popular plans */}
      {plan.mostPopular && (
        <>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-400/10 via-primary-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="-top-1 -right-1 absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-20 group-hover:opacity-30 blur-3xl transition-opacity duration-500" />
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
        <CardTitle className="font-bold text-foreground dark:group-hover:text-primary-300 group-hover:text-primary-700 text-xl transition-colors duration-300">
          {plan.name}
        </CardTitle>

        <div className="flex justify-center items-baseline gap-2">
          {selectedPrice?.compareAtPrice && (
            <span className="font-medium text-muted-foreground text-sm sm:text-lg line-through">
              {formatCurrency(selectedPrice.compareAtPrice)}
            </span>
          )}
          <div className="flex items-baseline">
            <span className="bg-clip-text bg-gradient-to-r from-primary-600 dark:from-primary-400 via-primary-700 dark:via-primary-500 to-primary-800 dark:to-primary-600 font-black text-transparent text-2xl sm:text-3xl">
              {formatCurrency(selectedPrice?.price || 0)}
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
              {(plan.features as PlanFeature[]).map((feature, index) => (
                <li key={index} className="">
                  <div className="group/feature flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        feature.included
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-800/30 group-hover/feature:scale-110"
                          : "bg-muted border-2 border-muted-foreground/30"
                      }`}
                    >
                      <Check
                        className={`h-3 transition-all duration-300 ${
                          feature.included ? "text-white" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 mb-1">
                      <span
                        className={`text-xs font-semibold transition-colors duration-300 ${
                          feature.included
                            ? "text-foreground group-hover/feature:text-primary-700 dark:group-hover/feature:text-primary-300"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.description}
                      </span>
                      {feature.note && <p className="mt-1 text-muted-foreground text-xs italic">{feature.note}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="z-10 relative px-4 pt-3 pb-4">
        <Button
          className={`w-full h-10 text-sm font-semibold transition-all duration-300 transform shadow-lg disabled:opacity-100 ${
            isFreePlan
              ? "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-300 cursor-not-allowed border-2 border-green-300 dark:border-green-700"
              : hasActiveSubscription && isCurrentPlan
              ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white cursor-not-allowed border-2 border-blue-400 dark:border-blue-500 shadow-blue-300 dark:shadow-blue-800/50"
              : hasActiveSubscription
              ? "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner border-2 border-gray-300 dark:border-gray-600 opacity-70"
              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-300 dark:shadow-primary-800/50 hover:shadow-xl hover:shadow-primary-400/50 dark:hover:shadow-primary-700/50 hover:scale-[1.015] active:scale-95"
          }`}
          variant={hasActiveSubscription || isFreePlan ? "secondary" : "default"}
          onClick={handleSelectPlan}
          disabled={hasActiveSubscription || isFreePlan}
        >
          <span className={`flex items-center justify-center gap-2`}>
            {isFreePlan && <Check className="w-4 h-4" />}
            {isCurrentPlan && !isFreePlan && <Check className="w-4 h-4" />}
            {!hasActiveSubscription && !isFreePlan && plan.mostPopular && <Star className="w-3 h-3 fill-current" />}
            {isFreePlan
              ? t("included")
              : hasActiveSubscription
              ? isCurrentPlan
                ? t("current plan")
                : t("already subscribed")
              : t("choose plan")}
            {!hasActiveSubscription && !isFreePlan && plan.mostPopular && <Star className="w-3 h-3 fill-current" />}
          </span>
        </Button>

        <SubscriptionDialog
          plan={plan}
          isOpen={showSubscriptionDialog}
          onClose={() => setShowSubscriptionDialog(false)}
          selectedInterval={selectedInterval}
        />
      </CardFooter>
    </Card>
  );
}

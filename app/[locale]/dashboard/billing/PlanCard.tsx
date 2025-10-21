"use client";

import { Check, Star, Sparkles, Crown } from "lucide-react";
import { Plan, User, Subscription } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SubscriptionDialog from "./SubscriptionDialog";

type Props = {
  plan: Plan;
  user?: User;
  onSelect?: (plan: Plan) => void;
};

export default function PlanCard({ plan, user, onSelect }: Props) {
  const t = useTranslations("pricing");
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  console.log("-------------------- user --------------------");
  console.log(user);
  const hasActiveSubscription = !!user?.currentSubscription;
  const isCurrentPlan = user?.currentSubscription?.plan?.id === plan.id;

  const handleSelectPlan = () => {
    if (hasActiveSubscription) return;

    if (onSelect) {
      onSelect(plan);
    } else {
      setShowSubscriptionDialog(true);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  return (
    <Card
      className={`relative flex flex-col justify-between transition-all mx-auto w-full max-w-[400px] duration-500 rounded-3xl border-2 shadow-lg hover:shadow-2xl hover:-translate-y-2 group
        ${
          plan.mostPopular
            ? "border-gradient-to-r from-primary-400 to-primary-600 bg-gradient-to-br via-white  dark:from-primary-950/50 dark:via-card dark:to-primary-950/30 shadow-primary-200/50 dark:shadow-primary-800/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gradient-to-br hover:from-primary-50/30 hover:to-white dark:hover:from-primary-950/20 dark:hover:to-card"
        }`}
    >
      {/* Animated gradient background for popular plans */}
      {plan.mostPopular && (
        <>
          <div className="rounded-3xl absolute inset-0 bg-gradient-to-r from-primary-400/10 via-primary-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-1 -right-1 w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
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
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
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
              {formatPrice(plan?.price || 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
          <p className="text-xs text-muted-foreground font-semibold px-2 py-1 bg-muted/50 rounded-full capitalize">
            / {t(plan?.interval?.toLowerCase() || "")}
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
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-800/30 group-hover/feature:scale-110"
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
                          ? "text-foreground group-hover/feature:text-primary-700 dark:group-hover/feature:text-primary-300"
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

      <CardFooter className="pt-3 pb-4 px-4 relative z-10">
        <Button
          className={`w-full h-10 text-sm font-semibold transition-all duration-300 transform shadow-lg ${
            hasActiveSubscription
              ? "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner border border-gray-300 dark:border-gray-600 opacity-75"
              : plan.mostPopular
              ? "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-300 dark:shadow-primary-800/50 hover:shadow-xl hover:shadow-primary-400/50 dark:hover:shadow-primary-700/50 hover:scale-105 active:scale-95"
              : "border-2 border-primary-500 text-primary-600 hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-700 hover:text-white hover:border-primary-600 hover:shadow-xl hover:shadow-primary-200 dark:hover:shadow-primary-800/30 hover:scale-105 active:scale-95"
          }`}
          variant={
            hasActiveSubscription
              ? "secondary"
              : plan.mostPopular
              ? "default"
              : "outline"
          }
          onClick={handleSelectPlan}
          disabled={hasActiveSubscription}
        >
          <span
            className={`flex items-center justify-center gap-2 ${
              hasActiveSubscription ? "opacity-80" : ""
            }`}
          >
            {!hasActiveSubscription && plan.mostPopular && (
              <Star className="w-3 h-3 fill-current" />
            )}
            {hasActiveSubscription
              ? isCurrentPlan
                ? t("current plan")
                : t("already subscribed")
              : t("choose plan")}
            {!hasActiveSubscription && plan.mostPopular && (
              <Star className="w-3 h-3 fill-current" />
            )}
          </span>
        </Button>

        <SubscriptionDialog
          plan={plan}
          isOpen={showSubscriptionDialog}
          onClose={() => setShowSubscriptionDialog(false)}
        />
      </CardFooter>
    </Card>
  );
}

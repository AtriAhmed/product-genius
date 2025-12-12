"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Info, Clock, Star, Crown, Zap, AlertTriangle, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import axios from "axios";
import { User, Subscription, Plan } from "@/types";
import PlanInfoDialog from "./PlanInfoDialog";
import { formatCurrency } from "@/lib/utils";

async function fetcher(): Promise<User> {
  const response = await axios.get("/api/users/current");
  return response.data;
}

type Props = {
  scrollToPlansList: () => void;
};

export default function CurrentSubscription({ scrollToPlansList }: Props) {
  const t = useTranslations("billing");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>("current-user", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const subscription = user?.currentSubscription;
  const plan = subscription?.plan;

  if (error) {
    toast.error("Failed to load subscription information");
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "trialing":
        return "secondary";
      case "past_due":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    return t(status?.toLowerCase() || "");
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Zap className="w-3 h-3" />;
      case "trialing":
        return <Clock className="w-3 h-3" />;
      case "past_due":
        return <AlertTriangle className="w-3 h-3" />;
      case "canceled":
        return <Calendar className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval?.toLowerCase()) {
      case "month":
        return t("per month");
      case "year":
        return t("per year");
      case "day":
        return t("per day");
      case "week":
        return t("per week");
      default:
        return interval;
    }
  };

  const handleSubscriptionToggle = async (cancelAtPeriodEnd: boolean) => {
    if (!subscription?.id) return;

    try {
      setIsToggling(true);
      await axios.patch(`/api/subscriptions/${subscription.id}`, {
        cancelAtPeriodEnd,
      });

      const successMessage = cancelAtPeriodEnd
        ? t("subscription will cancel at period end")
        : t("auto renewal reactivated");

      toast.success(successMessage);
      setTimeout(async () => {
        await mutate();
        setIsToggling(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating subscription:", error);
      const errorMessage = cancelAtPeriodEnd
        ? t("failed to cancel subscription")
        : t("failed to reactivate subscription");
      toast.error(errorMessage);
      setIsToggling(false);
    } finally {
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            {t("current subscription")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="w-32 h-6 rounded bg-muted animate-pulse" />
            <div className="w-24 h-4 rounded bg-muted animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="w-40 h-3 rounded bg-muted animate-pulse" />
            <div className="w-36 h-3 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`relative overflow-hidden border-border/50 ${
          subscription
            ? subscription.status === "ACTIVE"
              ? "bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/30"
              : subscription.status === "TRIALING"
              ? "bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/30"
              : subscription.status === "PAST_DUE"
              ? "bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/20 dark:to-rose-950/10 border-red-200/50 dark:border-red-800/30"
              : "bg-gradient-to-r from-background to-muted/30"
            : "bg-gradient-to-r from-background to-muted/30"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                {t("current subscription")}
              </CardTitle>
            </div>
            {plan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlanDialog(true)}
                className="w-6 h-6 p-0 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200"
              >
                <Info className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3">
          {!subscription ? (
            <div className="flex flex-col justify-center items-center py-3 text-center">
              <div className="relative mb-2">
                <div className="flex justify-center items-center w-20 h-20 mx-auto border border-amber-200/50 dark:border-amber-800/30 rounded-full bg-gradient-to-br from-amber-100 dark:from-amber-900/30 to-orange-100 dark:to-orange-900/30">
                  <Crown className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="-top-1 -right-1 absolute flex justify-center items-center w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
                  <Star className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="space-y-0.5 mb-3 text-center">
                <h3 className="font-semibold text-foreground text-base">{t("no active subscription")}</h3>
                <p className="max-w-xs text-muted-foreground text-xs leading-tight">
                  {t("choose a plan to enjoy our premium features")}
                </p>
              </div>
              <Button size="sm" className="gap-1.5" onClick={scrollToPlansList}>
                <Zap className="w-3.5 h-3.5" />
                {t("upgrade now")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                {/* Plan Info */}
                <div className="relative p-3 border border-border/50 rounded-lg bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex justify-center items-center gap-2">
                        <Crown className="w-8 h-8 text-primary" />
                        <h3 className="bg-clip-text bg-gradient-to-r from-foreground to-foreground/80 font-bold text-transparent text-lg">
                          {plan?.name}
                        </h3>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(subscription.status || "")}
                        className="flex items-center gap-1 h-5 px-2 py-0.5 shadow-sm font-medium text-xs"
                      >
                        {getStatusIcon(subscription.status || "")}
                        {getStatusLabel(subscription?.status || "")}
                      </Badge>
                    </div>
                    {plan && subscription.interval && (
                      <div className="flex justify-center items-baseline gap-2">
                        <span className="bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-bold text-transparent text-2xl">
                          {(() => {
                            const currentPrice = plan.prices?.find((price) => price.interval === subscription.interval);
                            return formatCurrency(currentPrice?.price || 0);
                          })()}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-muted/50 font-medium text-muted-foreground text-xs">
                          {getIntervalLabel(subscription.interval || "")}
                        </span>
                      </div>
                    )}
                    {/* Auto-renewal status indicator */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                        subscription.cancelAtPeriodEnd
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                          : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      }`}
                    >
                      {subscription.cancelAtPeriodEnd ? (
                        <>
                          <X className="w-3 h-3" />
                          <span>{t("cancels at period end")}</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>{t("auto renewal active")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription Dates */}
                <div className="flex flex-col justify-center space-y-1.5">
                  {subscription.startsAt && (
                    <div className="flex items-center gap-2 p-1.5 border border-border/30 rounded-md bg-muted/30">
                      <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          {t("starts at")}
                        </span>
                        <span className="font-medium text-xs">{formatDate(subscription.startsAt)}</span>
                      </div>
                    </div>
                  )}

                  {subscription.endsAt && (
                    <div className="flex items-center gap-2 p-1.5 border border-border/30 rounded-md bg-muted/30">
                      <div className="p-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        <Calendar className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          {t("ends at")}
                        </span>
                        <span className="font-medium text-xs">{formatDate(subscription.endsAt)}</span>
                      </div>
                    </div>
                  )}

                  {subscription.trialEndsAt && (
                    <div className="flex items-center gap-2 p-1.5 border border-purple-200/50 dark:border-purple-800/30 rounded-md bg-gradient-to-r from-purple-50/50 dark:from-purple-900/20 to-indigo-50/50 dark:to-indigo-900/20">
                      <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                        <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          {t("trial ends at")}
                        </span>
                        <span className="font-medium text-xs">{formatDate(subscription.trialEndsAt)}</span>
                      </div>
                    </div>
                  )}

                  {/* Cancel/Reactivate buttons */}
                  {subscription.status === "ACTIVE" && (
                    <div className="flex gap-1.5 mt-2">
                      {!subscription.cancelAtPeriodEnd ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSubscriptionToggle(true)}
                          disabled={isToggling}
                          className="h-7 px-2 py-1 text-xs"
                        >
                          {isToggling ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                              <span>{t("canceling")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <X className="w-3 h-3" />
                              <span>{t("cancel at period end")}</span>
                            </div>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSubscriptionToggle(false)}
                          disabled={isToggling}
                          className="h-7 px-2 py-1 hover:border-green-500/50 bg-green-600 hover:bg-green-700 text-xs"
                        >
                          {isToggling ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                              <span>{t("reactivating")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <RotateCcw className="w-3 h-3" />
                              <span>{t("reactivate auto renewal")}</span>
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {plan && (
        <PlanInfoDialog
          open={showPlanDialog}
          onOpenChange={setShowPlanDialog}
          plan={plan}
          subscriptionInterval={subscription?.interval}
        />
      )}
    </>
  );
}

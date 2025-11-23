"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Info, Clock, Star } from "lucide-react";
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

export default function CurrentSubscription() {
  const t = useTranslations("billing");
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  const {
    data: user,
    error,
    isLoading,
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
        return "primary";
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

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-primary-600" />
            {t("current subscription")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-24 rounded-lg bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                {t("current subscription")}
              </CardTitle>
            </div>
            {plan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlanDialog(true)}
                className="w-7 h-7 p-0 hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <Info className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            // <div className="py-6 text-center">
            //   <div className="flex justify-center items-center w-10 h-10 mx-auto mb-2 rounded-full bg-muted">
            //     <Calendar className="w-5 h-5 text-muted-foreground" />
            //   </div>
            //   <h3 className="mb-1 font-medium text-sm">
            //     {t("no subscription")}
            //   </h3>
            //   <p className="text-muted-foreground text-xs">
            //     {t("no subscription description")}
            //   </p>
            // </div>
            <div className="flex flex-col items-center col-span-full text-center">
              <div className="flex justify-center items-center size-8 mx-auto mb-2 rounded-full bg-muted">
                <Star className="size-5 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{t("no active subscription")}</h3>
              <p className="mb-4 text-muted-foreground text-xs">{t("choose a plan to enjoy our premium features")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Plan Info */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{plan?.name}</h3>
                    <Badge variant={getStatusBadgeVariant(subscription.status || "")} className="h-5 py-0 text-xs">
                      {getStatusLabel(subscription?.status || "")}
                    </Badge>
                  </div>
                  {plan && subscription.interval && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-sm">
                        {(() => {
                          const currentPrice = plan.prices?.find((price) => price.interval === subscription.interval);
                          return formatCurrency(currentPrice?.price || 0);
                        })()}
                      </span>
                      <span className="text-xs">{getIntervalLabel(subscription.interval || "")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Dates */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                {subscription.startsAt && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">{t("starts at")}:</span>
                    <span className="font-medium">{formatDate(subscription.startsAt)}</span>
                  </div>
                )}

                {subscription.endsAt && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">{t("ends at")}:</span>
                    <span className="font-medium">{formatDate(subscription.endsAt)}</span>
                  </div>
                )}

                {subscription.trialEndsAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">{t("trial ends at")}:</span>
                    <span className="font-medium">{formatDate(subscription.trialEndsAt)}</span>
                  </div>
                )}
              </div>

              {/* Cancel at period end notice */}
              {subscription.cancelAtPeriodEnd && (
                <div className="p-2.5 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <p className="text-orange-800 dark:text-orange-200 text-xs">
                    Your subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              )}
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

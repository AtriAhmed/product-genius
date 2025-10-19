"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Info, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import axios from "axios";
import { User, Subscription, Plan } from "@/types";
import PlanInfoDialog from "./PlanInfoDialog";

type CurrentUserResponse = {
  user: User & {
    currentSubscription?: Subscription & {
      plan?: Plan;
    };
  };
};

async function fetcher(): Promise<CurrentUserResponse> {
  const response = await axios.get("/api/users/current");
  return response.data;
}

export default function CurrentSubscription() {
  const t = useTranslations("billing");
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  const { data, error, isLoading } = useSWR<CurrentUserResponse>(
    "current-user",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const subscription = data?.user?.currentSubscription;
  const plan = subscription?.plan;

  if (error) {
    toast.error("Failed to load subscription information");
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UK", {
      style: "currency",
      currency: "EUR",
    }).format(price);
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
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-background">
        <CardHeader>
          <div className="flex items-center justify-between">
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
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-7 w-7 p-0"
              >
                <Info className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {t("no subscription")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("no subscription description")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Plan Info */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{plan?.name}</h3>
                    <Badge
                      variant={getStatusBadgeVariant(subscription.status)}
                      className="text-xs py-0 h-5"
                    >
                      {getStatusLabel(subscription.status)}
                    </Badge>
                  </div>
                  {plan && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-sm">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-xs">
                        {getIntervalLabel(plan.interval)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Dates */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                {subscription.startsAt && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">
                      {t("starts at")}:
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.startsAt)}
                    </span>
                  </div>
                )}

                {subscription.endsAt && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">
                      {t("ends at")}:
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.endsAt)}
                    </span>
                  </div>
                )}

                {subscription.trialEndsAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">
                      {t("trial ends at")}:
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.trialEndsAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Cancel at period end notice */}
              {subscription.cancelAtPeriodEnd && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5">
                  <p className="text-xs text-orange-800 dark:text-orange-200">
                    Your subscription will be canceled at the end of the current
                    billing period.
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
        />
      )}
    </>
  );
}

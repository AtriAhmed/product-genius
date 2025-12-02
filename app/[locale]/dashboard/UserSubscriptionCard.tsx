import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";

type SubscriptionData = {
  planName: string;
  status: string;
  interval: string;
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};

type UserSubscriptionCardProps = {
  data: SubscriptionData;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return CheckCircle;
    case "TRIALING":
      return Clock;
    case "PAST_DUE":
    case "CANCELED":
    case "UNPAID":
      return AlertCircle;
    default:
      return CreditCard;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "TRIALING":
      return "secondary";
    case "PAST_DUE":
    case "CANCELED":
    case "UNPAID":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string) => {
  const labels = {
    ACTIVE: "Active",
    TRIALING: "Trial",
    PAST_DUE: "Past Due",
    CANCELED: "Canceled",
    INCOMPLETE: "Incomplete",
    UNPAID: "Unpaid",
  };
  return labels[status as keyof typeof labels] || status;
};

const getIntervalLabel = (interval: string) => {
  const labels = {
    DAY: "daily",
    WEEK: "weekly",
    MONTH: "monthly",
    YEAR: "yearly",
  };
  return labels[interval as keyof typeof labels] || interval.toLowerCase();
};

export default function UserSubscriptionCard({ data }: UserSubscriptionCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatusIcon = getStatusIcon(data.status);
  const isTrialing = data.status === "TRIALING";
  const isCanceled = data.status === "CANCELED" || data.cancelAtPeriodEnd;
  const isPastDue = data.status === "PAST_DUE";

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Your Subscription
          <Badge variant={getStatusColor(data.status)} className="ml-auto">
            <StatusIcon className="w-3 h-3 mr-1" />
            {getStatusLabel(data.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          {/* Plan Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.planName}</h3>
            <p className="font-bold text-primary text-2xl">
              {formatCurrency(data.value)}
              <span className="ml-1 font-normal text-muted-foreground text-sm">
                / {getIntervalLabel(data.interval)}
              </span>
            </p>
          </div>

          {/* Important Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Dates</span>
            </div>

            {isTrialing && data.trialEndsAt && (
              <div className="text-sm">
                <span className="text-muted-foreground">Trial ends:</span>
                <br />
                <span className="font-medium">{formatDate(data.trialEndsAt)}</span>
              </div>
            )}

            {data.endsAt && !isTrialing && (
              <div className="text-sm">
                <span className="text-muted-foreground">{isCanceled ? "Ends:" : "Next billing:"}</span>
                <br />
                <span className="font-medium">{formatDate(data.endsAt)}</span>
              </div>
            )}

            {data.startsAt && !isTrialing && (
              <div className="text-sm">
                <span className="text-muted-foreground">Started:</span>
                <br />
                <span className="font-medium">{formatDate(data.startsAt)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isPastDue && (
              <div className="p-3 border border-destructive/20 rounded-lg bg-destructive/10">
                <div className="flex items-center gap-2 font-medium text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Payment Required
                </div>
                <p className="mt-1 text-destructive/80 text-xs">
                  Please update your payment method to continue your subscription.
                </p>
              </div>
            )}

            {isCanceled && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">Subscription Ending</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Your subscription will end on {formatDate(data.endsAt)}.
                </p>
              </div>
            )}

            {isTrialing && (
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 font-medium text-blue-700 text-sm">
                  <Clock className="w-4 h-4" />
                  Free Trial
                </div>
                <p className="mt-1 text-blue-600 text-xs">Enjoy full access until {formatDate(data.trialEndsAt)}.</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1">
                Manage
              </Button>
              {data.status === "ACTIVE" && !data.cancelAtPeriodEnd && (
                <Button size="sm" variant="ghost" className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

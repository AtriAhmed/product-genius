"use client";

import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { Plan } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";

type PlansResponse = {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

async function fetcher(filter: string): Promise<PlansResponse> {
  const response = await axios.get("/api/plans", {
    params: {
      filter: filter === "all" ? undefined : filter,
      sortBy: "sortOrder",
      sortOrder: "asc",
      limit: 100, // Get all plans
    },
  });
  return response.data;
}

export default function PlansList() {
  const t = useTranslations("pricing");

  const { data, error, isLoading } = useSWR<PlansResponse>(
    ["plans", "active"], // Only show active plans
    () => fetcher("active"),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatInterval = (interval: string) => {
    const intervalMap: { [key: string]: string } = {
      DAY: t("day"),
      WEEK: t("week"),
      MONTH: t("month"),
      YEAR: t("year"),
    };
    return intervalMap[interval] || interval.toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="relative">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("failed to load plans")}</p>
      </div>
    );
  }

  const plans = data?.data || [];

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("no plans available")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative transition-all hover:shadow-lg ${
            plan.mostPopular
              ? "border-2 border-primary shadow-md"
              : "border hover:border-primary/50"
          }`}
        >
          {plan.mostPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full">
                <Star className="w-3 h-3 mr-1" />
                {t("popular")}
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(plan.price)}
              </span>
              <span className="text-muted-foreground">
                /{formatInterval(plan.interval)}
              </span>
            </div>
            {plan.description && (
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        feature.included
                          ? "text-primary-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.description}
                      </span>
                      {feature.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          <CardFooter className="pt-4">
            <Button
              className="w-full"
              variant={plan.mostPopular ? "default" : "outline"}
            >
              {t("choose plan")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

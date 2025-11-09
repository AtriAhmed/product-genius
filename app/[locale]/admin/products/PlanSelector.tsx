"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, Crown, Users, Loader2, AlertCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plan } from "@/types";
import axios from "axios";

type PlanSelectorProps = {
  selectedPlanIds: number[];
  onChange: (planIds: number[]) => void;
  error?: string;
};

export default function PlanSelector({ selectedPlanIds, onChange, error }: PlanSelectorProps) {
  const t = useTranslations("products");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await axios.get("/api/plans?filter=active&limit=100");
        setPlans(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setFetchError("Failed to load plans");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const togglePlan = (planId: number) => {
    const newSelectedIds = selectedPlanIds.includes(planId)
      ? selectedPlanIds.filter((id) => id !== planId)
      : [...selectedPlanIds, planId];
    onChange(newSelectedIds);
  };

  const selectAll = () => {
    onChange(plans.map((plan) => plan.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const formatPrice = (plan: Plan) => {
    const lowestPrice = plan.prices?.reduce((min, price) => {
      if (price.price && (!min || price.price < min)) return price.price;
      return min;
    }, null as number | null);

    if (!lowestPrice) return "Free";
    return `€${lowestPrice}`;
  };

  const getSubscriptionCount = (plan: Plan) => {
    return (plan as any)._count?.subscriptions || 0;
  };

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">{t("select plans")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="w-20 h-4 mb-2" />
                <Skeleton className="w-12 h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="border-destructive/20 bg-background">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{fetchError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-semibold text-lg">{t("select plans")}</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={selectedPlanIds.length === plans.length}
            >
              {t("select all")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={selectedPlanIds.length === 0}
            >
              {t("clear all")}
            </Button>
          </div>
        </div>
        {selectedPlanIds.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {selectedPlanIds.length} plan{selectedPlanIds.length > 1 ? "s" : ""} selected
          </p>
        )}
        {error && (
          <p className="flex items-center gap-1 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-muted-foreground text-center">
            <Star className="w-8 h-8 mb-2" />
            <p className="font-medium text-sm">{t("no plans available")}</p>
            <p className="text-xs">{t("please create plans to assign to products")}</p>
          </div>
        ) : (
          <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanIds.includes(plan.id);

              return (
                <div
                  key={plan.id}
                  onClick={() => togglePlan(plan.id)}
                  className={`
                    relative cursor-pointer rounded-lg border p-3 transition-all duration-200
                    ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                  `}
                >
                  {/* Selection indicator */}
                  <div
                    className={`
                      absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full border transition-all
                      ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>

                  {/* Plan content */}
                  <div className="pr-6">
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-medium text-sm truncate">{plan.name}</h3>
                      {plan.mostPopular && <Crown className="flex-shrink-0 w-3 h-3 text-yellow-500" />}
                    </div>

                    <div className="font-medium text-primary text-xs">{formatPrice(plan)}</div>
                  </div>

                  {/* Inactive overlay */}
                  {!plan.active && (
                    <div className="absolute inset-0 flex justify-center items-center rounded-lg bg-muted/80">
                      <span className="text-muted-foreground text-xs">Inactive</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

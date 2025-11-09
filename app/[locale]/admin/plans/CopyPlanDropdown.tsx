"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plan } from "@/types";
import axios from "axios";
import { Copy, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { PlanFormData } from "./types";

type CopyPlanDropdownProps = {
  setValue: UseFormSetValue<PlanFormData>;
  currentPlanId?: number;
};

export default function CopyPlanDropdown({ setValue, currentPlanId }: CopyPlanDropdownProps) {
  const t = useTranslations("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/plans?limit=100");
        const filteredPlans = response.data.data.filter((plan: Plan) => plan.id !== currentPlanId);
        setPlans(filteredPlans);
      } catch (error) {
        toast.error(t("failed to fetch plans"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [currentPlanId, t]);

  const handleCopyPlan = (plan: Plan) => {
    setValue("name", `${plan.name} (Copy)`);
    setValue("description", plan.description || "");
    setValue("active", plan?.active || false);
    setValue("features", plan?.features || []);
    setValue("mostPopular", false); // Reset most popular
    setValue("sortOrder", plan?.sortOrder || 0);

    // Copy prices with proper structure
    const prices = plan.prices || [];
    if (prices.length > 0) {
      setValue(
        "prices",
        prices.map((price) => ({
          interval: price.interval || "MONTH",
          price: price.price || undefined,
          compareAtPrice: price.compareAtPrice,
        }))
      );
    } else {
      // Default structure if no prices
      setValue("prices", [{ interval: "DAY" }, { interval: "WEEK" }, { interval: "MONTH" }, { interval: "YEAR" }]);
    }

    toast.success(t("plan data copied successfully"));
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "DAY":
        return t("daily");
      case "WEEK":
        return t("weekly");
      case "MONTH":
        return t("monthly");
      case "YEAR":
        return t("yearly");
      default:
        return interval;
    }
  };

  const formatPrice = (price: number, interval: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
    return `${formatted}/${getIntervalLabel(interval).toLowerCase()}`;
  };

  if (plans.length === 0 && !isLoading) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Copy className="w-4 h-4 mr-2" />
          {t("copy from plan")}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {plans.map((plan) => {
          const priceObj = plan.prices?.find((p) => p.interval === "MONTH") || plan.prices?.[0];
          const priceDisplay = formatPrice(priceObj?.price || 0, priceObj?.interval || "MONTH");

          return (
            <DropdownMenuItem key={plan.id} onClick={() => handleCopyPlan(plan)} className="flex gap-2 px-2 py-1">
              <div className="font-medium text-sm">{plan.name}</div>
              <div className="font-medium text-muted-foreground text-sm">({priceDisplay})</div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

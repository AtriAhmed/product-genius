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

export default function CopyPlanDropdown({
  setValue,
  currentPlanId,
}: CopyPlanDropdownProps) {
  const t = useTranslations("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/plans?limit=100");
        const filteredPlans = response.data.data.filter(
          (plan: Plan) => plan.id !== currentPlanId
        );
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
    setValue("oldPrice", plan.oldPrice);
    setValue("price", plan.price);
    setValue("interval", plan.interval);
    setValue("active", plan.active);
    setValue("features", plan.features || []);
    setValue("mostPopular", false); // Reset most popular
    setValue("sortOrder", plan.sortOrder);

    toast.success(t("plan data copied successfully"));
  };

  if (plans.length === 0 && !isLoading) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Copy className="h-4 w-4 mr-2" />
          {t("copy from plan")}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {plans.map((plan) => (
          <DropdownMenuItem
            key={plan.id}
            onClick={() => handleCopyPlan(plan)}
            className="flex items-start px-3 py-1"
          >
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-muted-foreground">
              ${plan.price}/{plan.interval.toLowerCase()}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Star, Users } from "lucide-react";
import { format } from "date-fns";
import { Plan } from "@/types";

interface PlansDataTableProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  isLoading?: boolean;
}

export default function PlansDataTable({
  plans,
  onEdit,
  onDelete,
  isLoading = false,
}: PlansDataTableProps) {
  const t = useTranslations("plans");

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 rounded-lg bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-muted-foreground text-lg">
          {t("no plans found")}
        </div>
        <p className="text-muted-foreground text-sm">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="w-0 min-w-full border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t("plan name")}</TableHead>
            <TableHead className="w-[150px]">{t("price")}</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">{t("subscriptions")}</TableHead>
            <TableHead className="w-[150px]">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{plan.name}</span>
                    {plan.mostPopular && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" />
                        {t("popular")}
                      </Badge>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-muted-foreground text-sm line-clamp-1">
                      {plan.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatPrice(plan?.price || 0, plan?.interval || "")}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? t("active") : t("inactive")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{(plan as any)._count?.subscriptions || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {plan?.createdAt
                  ? format(new Date(plan.createdAt), "MMM d, yyyy")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(plan)}
                    className="w-8 h-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">{t("edit")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(plan)}
                    className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">{t("delete")}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Eye, Star, Users, Package } from "lucide-react";
import { format } from "date-fns";
import { Plan } from "@/types";
import { Link, useRouter } from "@/i18n/navigation";
import { stopPropagation } from "@/lib/utils";

interface PlansDataTableProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  isLoading?: boolean;
}

export default function PlansDataTable({ plans, onEdit, onDelete, isLoading = false }: PlansDataTableProps) {
  const t = useTranslations("plans");
  const router = useRouter();

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
      currency: "USD",
    }).format(price);
    return `${formatted}/${getIntervalLabel(interval).toLowerCase()}`;
  };

  function getPriceDisplay(plan: Plan) {
    if (!plan.prices || plan.prices.length === 0) {
      return t("no pricing set");
    }

    const priceObj = plan.prices?.find((p) => p.interval === "MONTH") || plan.prices[0];

    return formatPrice(priceObj.price || 0, priceObj.interval || "MONTH");
  }

  function handleView(event: React.MouseEvent, plan: Plan) {
    if (event.ctrlKey) {
      window.open(`/admin/plans/${plan.id}`, "_blank");
    } else {
      router.push(`/admin/plans/${plan.id}`);
    }
  }

  const skeletonRows = Array.from({ length: 4 }).map((_, idx) => (
    <TableRow key={`skeleton-${idx}`} className="border-border transition-colors">
      {/* Plan name */}
      <TableCell className="font-medium">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-40 h-4 rounded" />
          <Skeleton className="w-60 max-w-xs h-3 rounded" />
        </div>
      </TableCell>

      {/* Price */}
      <TableCell className="py-1">
        <Skeleton className="w-24 h-4 rounded" />
      </TableCell>

      {/* Status */}
      <TableCell className="py-1">
        <Skeleton className="w-16 h-6 rounded-full" />
      </TableCell>

      {/* Subscriptions */}
      <TableCell className="py-1">
        <Skeleton className="w-12 h-4 rounded" />
      </TableCell>

      {/* Products */}
      <TableCell className="py-1">
        <Skeleton className="w-12 h-4 rounded" />
      </TableCell>

      {/* Created */}
      <TableCell className="py-1">
        <Skeleton className="w-20 h-4 rounded" />
      </TableCell>

      {/* Actions */}
      <TableCell className="py-1">
        <div className="flex justify-end gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </TableCell>
    </TableRow>
  ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no plans found")}</h3>
          <p className="mb-4 text-muted-foreground text-sm">{t("try adjusting your search or filters")}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-md bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-[300px] font-medium">{t("plan name")}</TableHead>
            <TableHead className="w-[150px] font-medium">{t("price")}</TableHead>
            <TableHead className="w-[120px] font-medium">{t("status")}</TableHead>
            <TableHead className="w-[100px] font-medium">{t("subscriptions")}</TableHead>
            <TableHead className="w-[100px] font-medium">{t("products")}</TableHead>
            <TableHead className="w-[150px] font-medium">{t("created")}</TableHead>
            <TableHead className="font-medium text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : plans.length > 0
            ? plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    handleView(e, plan);
                  }}
                >
                  <TableCell className="py-1">
                    <Link
                      href={`/admin/plans/${plan.id}`}
                      className="space-y-1 hover:underline"
                      onClick={stopPropagation}
                    >
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
                        <p className="text-muted-foreground text-sm line-clamp-1">{plan.description}</p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="font-medium">{getPriceDisplay(plan)}</div>
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge variant={plan.active ? "success" : "secondary"}>
                      {plan.active ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{plan._count?.subscriptions || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>{plan._count?.products || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 text-muted-foreground">
                    {plan?.createdAt ? format(new Date(plan.createdAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* <Button variant="ghost" size="sm" onClick={() => onEdit(plan)} className="w-8 h-8 p-0">
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">{t("edit")}</span>
                      </Button> */}
                      {!plan?.isFree && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(plan);
                          }}
                          className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">{t("delete")}</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

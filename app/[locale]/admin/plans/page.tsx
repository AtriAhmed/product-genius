"use client";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Plan } from "@/types";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";
import PlansDataTable from "./PlansDataTable";
import PlansFilter from "./PlansFilter";

interface PlansResponse {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetcher(page: number, limit: number, search: string, filter: string, sortBy: string, sortOrder: string) {
  const response = await axios.get("/api/plans", {
    params: { page, limit, search, filter, sortBy, sortOrder },
  });
  return response.data;
}

export default function PlansPage() {
  const t = useTranslations("plans");
  const router = useRouter();
  const [deletePlan, setDeletePlan] = useState<Plan | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isDeleting, setIsDeleting] = useState(false);

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<PlansResponse>(
    ["plans", page, limit, search, filter, sortBy, sortOrder],
    () => fetcher(page, limit, search, filter, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const plans = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load plans"));
  }

  const handleAddPlan = () => {
    router.push("/admin/plans/new");
  };

  const handleEditPlan = (plan: Plan) => {
    router.push(`/admin/plans/${plan.id}`);
  };

  const handleDeletePlan = (plan: Plan) => {
    setDeletePlan(plan);
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/plans/${deletePlan.id}`);
      toast.success(t("plan deleted successfully"));
      mutate();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error(error instanceof Error ? error.message : t("failed to delete plan"));
    } finally {
      setDeletePlan(undefined);
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSortBy("sortOrder");
    setSortOrder("asc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">{t("plans")}</h1>
            <p className="mt-2 text-muted-foreground">{t("manage your plans")}</p>
          </div>
          <Button onClick={handleAddPlan} className="gap-2">
            <Plus className="w-4 h-4" />
            {t("add plan")}
          </Button>
        </div>

        {/* Filters */}
        <PlansFilter
          search={search}
          filter={filter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Plans Data Table */}
        <PlansDataTable plans={plans} onEdit={handleEditPlan} onDelete={handleDeletePlan} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && plans.length > 0 && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}

        {/* Results Count */}
        {!isLoading && plans.length > 0 && (
          <div className="mt-4 text-muted-foreground text-sm text-center">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deletePlan}
        onOpenChange={() => setDeletePlan(undefined)}
        title={t("delete plan")}
        description={t("are you sure delete")}
        alertMessage="This action cannot be undone."
        confirmText={t("delete plan")}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}

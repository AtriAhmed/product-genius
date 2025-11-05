"use client";

import { useState } from "react";
import { Order } from "@/types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import OrdersFilters from "@/app/[locale]/dashboard/orders/OrdersFilters";
import OrdersDataTable from "@/app/[locale]/dashboard/orders/OrdersDataTable";

type OrdersResponse = {
  data: Order[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

async function fetcher(
  page: number,
  limit: number,
  search: string,
  status: string,
  sortBy: string,
  sortOrder: string
) {
  const params: any = { page, limit };

  if (search) params.search = search;
  if (status !== "all") params.status = status;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  const response = await axios.get("/api/orders", { params });
  return response.data;
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    ["orders", page, limit, search, status, sortBy, sortOrder],
    () => fetcher(page, limit, search, status, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Get orders from SWR data
  const orders = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load orders"));
  }

  const handleViewOrder = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {t("orders")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("manage orders")}</p>
          </div>
        </div>

        {/* Filters */}
        <OrdersFilters
          search={search}
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Orders Data Table */}
        <OrdersDataTable
          orders={orders}
          onView={handleViewOrder}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {!isLoading && orders.length > 0 && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}

        {/* Results Count */}
        {!isLoading && orders.length > 0 && (
          <div className="mt-4 text-muted-foreground text-sm text-center">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

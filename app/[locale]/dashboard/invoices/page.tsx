"use client";

import { useState } from "react";
import { Invoice } from "@/types";
import { useTranslations } from "next-intl";
import Pagination from "@/components/Pagination";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import InvoicesFilters from "@/app/[locale]/dashboard/invoices/InvoicesFilters";
import InvoicesDataTable from "@/app/[locale]/dashboard/invoices/InvoicesDataTable";

type InvoicesResponse = {
  data: Invoice[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

async function fetcher(
  page: number,
  limit: number,
  type: string,
  status: string,
  sortBy: string,
  sortOrder: string
) {
  const params: any = { page, limit };

  if (type !== "all") params.type = type;
  if (status !== "all") params.status = status;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  const response = await axios.get("/api/invoices", { params });
  return response.data;
}

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // SWR hook for data fetching
  const { data, error, isLoading } = useSWR<InvoicesResponse>(
    ["invoices", page, limit, type, status, sortBy, sortOrder],
    () => fetcher(page, limit, type, status, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Get invoices from SWR data
  const invoices = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load invoices"));
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (!invoice.pdfUrl) {
      toast.error(t("no pdf available"));
      return;
    }

    // Create a temporary link and click it to download
    const link = document.createElement("a");
    link.href = invoice.pdfUrl;
    link.download = `invoice-${invoice.id}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("invoice downloaded"));
  };

  const handleViewHostedInvoice = (invoice: Invoice) => {
    if (!invoice.hostedUrl) {
      toast.error(t("no hosted url available"));
      return;
    }

    window.open(invoice.hostedUrl, "_blank");
    toast.success(t("opened invoice"));
  };

  const clearFilters = () => {
    setType("all");
    setStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 py-2 container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {t("invoices")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("manage invoices")}</p>
          </div>
        </div>

        {/* Filters */}
        <InvoicesFilters
          type={type}
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onTypeChange={handleTypeChange}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Invoices Data Table */}
        <InvoicesDataTable
          invoices={invoices}
          onDownload={handleDownloadInvoice}
          onViewHosted={handleViewHostedInvoice}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {!isLoading && invoices.length > 0 && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}

        {/* Results Count */}
        {!isLoading && invoices.length > 0 && (
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

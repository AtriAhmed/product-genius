"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FAQ } from "@/types";
import Pagination from "@/components/Pagination";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import FaqsFilter from "./FaqsFilter";
import FaqsDataTable from "./FaqsDataTable";
import FaqDialog from "./FaqDialog";

interface FaqsResponse {
  data: FAQ[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetcher(page: number, limit: number, search: string, sortBy: string, sortOrder: string) {
  const response = await axios.get("/api/faqs", {
    params: { page, limit, search, sortBy, sortOrder },
  });
  return response.data;
}

export default function FaqsPage() {
  const t = useTranslations("faqs");
  const [deleteFaq, setDeleteFaq] = useState<FAQ | undefined>();
  const [editFaq, setEditFaq] = useState<FAQ | undefined>();
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<FaqsResponse>(
    ["faqs", page, limit, search, sortBy, sortOrder],
    () => fetcher(page, limit, search, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const faqs = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  if (error) {
    toast.error(t("failed to load faqs"));
  }

  const handleAddFaq = () => {
    setEditFaq(undefined);
    setShowDialog(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditFaq(faq);
    setShowDialog(true);
  };

  const handleDeleteFaq = (faq: FAQ) => {
    if (isDeleting) return;
    setDeleteFaq(faq);
  };

  const confirmDelete = async () => {
    if (!deleteFaq) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/faqs/${deleteFaq.id}`);
      toast.success(t("faq deleted successfully"));
      mutate();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error(error instanceof Error ? error.message : t("failed to delete faq"));
    } finally {
      setDeleteFaq(undefined);
      setIsDeleting(false);
    }
  };

  const handleSaveFaq = async (faqData: { question: string; answer: string; order: number }) => {
    setIsSaving(true);
    try {
      if (editFaq) {
        await axios.put(`/api/faqs/${editFaq.id}`, faqData);
        toast.success(t("faq updated successfully"));
      } else {
        await axios.post("/api/faqs", faqData);
        toast.success(t("faq created successfully"));
      }
      mutate();
      setShowDialog(false);
      setEditFaq(undefined);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(error instanceof Error ? error.message : t("failed to save faq"));
    } finally {
      setIsSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("order");
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-3xl">{t("faqs")}</h1>
            <p className="text-muted-foreground">{t("manage your faqs")}</p>
          </div>
          <Button onClick={handleAddFaq} className="gap-2" variant="primary">
            <Plus className="w-4 h-4" />
            {t("add faq")}
          </Button>
        </div>

        <FaqsFilter
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        <FaqsDataTable faqs={faqs} onEdit={handleEditFaq} onDelete={handleDeleteFaq} isLoading={isLoading} />

        {!isLoading && faqs.length > 0 && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}

        {!isLoading && faqs.length > 0 && (
          <div className="mt-4 text-muted-foreground text-sm text-center">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!deleteFaq}
        onOpenChange={() => setDeleteFaq(undefined)}
        title={t("delete faq")}
        description={t("are you sure delete")}
        alertMessage="This action cannot be undone."
        confirmText={t("delete faq")}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      <FaqDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        faq={editFaq}
        onSave={handleSaveFaq}
        isSaving={isSaving}
      />
    </div>
  );
}

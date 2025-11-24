"use client";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { ShippingZone } from "@/types";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import axios from "axios";
import ShippingZonesDataTable from "./ShippingZonesDataTable";
import ShippingZonesFilter from "./ShippingZonesFilter";
import ShippingZoneDialog from "./ShippingZoneDialog";

interface ShippingZonesResponse {
  data: ShippingZone[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetcher(page: number, limit: number, search: string, sortBy: string, sortOrder: string) {
  const response = await axios.get("/api/shipping-zones", {
    params: { page, limit, search, sortBy, sortOrder },
  });
  return response.data;
}

export default function ShippingZonesPage() {
  const t = useTranslations("shipping-zones");
  const [deleteZone, setDeleteZone] = useState<ShippingZone | undefined>();
  const [editZone, setEditZone] = useState<ShippingZone | undefined>();
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<ShippingZonesResponse>(
    ["shipping-zones", page, limit, search, sortBy, sortOrder],
    () => fetcher(page, limit, search, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const shippingZones = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  if (error) {
    toast.error(t("failed to load shipping zones"));
  }

  const handleAddZone = () => {
    setEditZone(undefined);
    setShowDialog(true);
  };

  const handleEditZone = (zone: ShippingZone) => {
    setEditZone(zone);
    setShowDialog(true);
  };

  const handleDeleteZone = (zone: ShippingZone) => {
    if (isDeleting) return;

    if (zone._count?.productShippingZones && zone._count.productShippingZones > 0) {
      toast.error(t("cannot delete zone with products"));
      return;
    }

    setDeleteZone(zone);
  };

  const confirmDelete = async () => {
    if (!deleteZone) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/shipping-zones/${deleteZone.id}`);
      toast.success(t("zone deleted successfully"));
      mutate();
    } catch (error) {
      console.error("Error deleting shipping zone:", error);
      toast.error(error instanceof Error ? error.message : t("failed to delete zone"));
    } finally {
      setDeleteZone(undefined);
      setIsDeleting(false);
    }
  };

  const handleSaveZone = async (zoneData: { name: string; countries: string[] }) => {
    setIsSaving(true);
    try {
      if (editZone) {
        await axios.put(`/api/shipping-zones/${editZone.id}`, zoneData);
        toast.success(t("zone updated successfully"));
      } else {
        await axios.post("/api/shipping-zones", zoneData);
        toast.success(t("zone created successfully"));
      }
      mutate();
      setShowDialog(false);
      setEditZone(undefined);
    } catch (error) {
      console.error("Error saving shipping zone:", error);
      toast.error(error instanceof Error ? error.message : t("failed to save zone"));
    } finally {
      setIsSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("name");
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
            <h1 className="font-bold text-foreground text-3xl">{t("shipping zones")}</h1>
            <p className="mt-2 text-muted-foreground">{t("manage your shipping zones")}</p>
          </div>
          <Button onClick={handleAddZone} className="gap-2" variant="primary">
            <Plus className="w-4 h-4" />
            {t("add zone")}
          </Button>
        </div>

        <ShippingZonesFilter
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        <ShippingZonesDataTable
          shippingZones={shippingZones}
          onEdit={handleEditZone}
          onDelete={handleDeleteZone}
          isLoading={isLoading}
        />

        {!isLoading && shippingZones.length > 0 && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}

        {!isLoading && shippingZones.length > 0 && (
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
        open={!!deleteZone}
        onOpenChange={() => setDeleteZone(undefined)}
        title={t("delete zone")}
        description={t("are you sure delete")}
        alertMessage="This action cannot be undone."
        confirmText={t("delete zone")}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ShippingZoneDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        zone={editZone}
        onSave={handleSaveZone}
        isSaving={isSaving}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { User } from "@/types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import UsersFilters from "./UsersFilters";
import UsersDataTable from "./UsersDataTable";
import EditUserDialog from "./EditUserDialog";

type UsersResponse = {
  data: User[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

async function fetcher(page: number, limit: number, search: string, role: string, sortBy: string, sortOrder: string) {
  const params: any = { page, limit };

  if (search) params.search = search;
  if (role !== "all") params.role = role;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  const response = await axios.get("/api/users", { params });
  return response.data;
}

export default function UsersPage() {
  const t = useTranslations("users");
  const router = useRouter();
  const [deleteUser, setDeleteUser] = useState<User | undefined>();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    ["users", page, limit, search, role, sortBy, sortOrder],
    () => fetcher(page, limit, search, role, sortBy, sortOrder),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Get users from SWR data
  const users = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    limit: data?.limit || 20,
    total: data?.total || 0,
    pages: data?.pages || 0,
  };

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load users"));
  }

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      await axios.delete(`/api/users/${deleteUser.id}`);
      toast.success(t("user deleted successfully"));
      mutate();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.error || t("failed to delete user"));
    } finally {
      setDeleteUser(undefined);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <div>
            <h1 className="font-bold text-foreground text-3xl">{t("users")}</h1>
            <p className="mt-2 text-muted-foreground">{t("manage users")}</p>
          </div>
          {/* <Button onClick={handleAddUser} className="gap-2">
            <Plus className="w-4 h-4" />
            {t("add user")}
          </Button> */}
        </div>

        {/* Filters */}
        <UsersFilters
          search={search}
          role={role}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1);
          }}
          onRoleChange={(newRole) => {
            setRole(newRole);
            setPage(1);
          }}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {/* Users Data Table */}
        <UsersDataTable users={users} onEdit={setEditUser} onDelete={handleDeleteUser} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && users.length > 0 && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}

        {/* Results Count */}
        {!isLoading && users.length > 0 && (
          <div className="mt-4 text-muted-foreground text-sm text-center">
            {t("showing results", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onUserUpdated={mutate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteUser}
        onOpenChange={() => setDeleteUser(undefined)}
        title={t("delete user")}
        description={t("are you sure delete user")}
        alertMessage={t("this action cannot be undone")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}

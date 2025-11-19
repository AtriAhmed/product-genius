"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

type Notification = {
  id: number;
  userId: number;
  title?: string;
  message: string;
  link?: string;
  type: NotificationType;
  event: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  user: {
    id: number;
    name?: string;
    email: string;
  };
};

type NotificationsResponse = {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

async function fetcher(page: number, limit: number, search: string, filter: string, sortBy: string, sortOrder: string) {
  const response = await axios.get("/api/notifications", {
    params: { page, limit, search, filter, sortBy, sortOrder },
  });
  return response.data;
}

export default function NotificationsSheet() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);

  const { data, error, isLoading, mutate, isValidating } = useSWR<NotificationsResponse>(
    ["notifications"],
    () => fetcher(1, 20, "", "all", "createdAt", "desc"),
    {
      revalidateOnFocus: false,
    }
  );

  // Loading states for updates
  const [bulkLoading, setBulkLoading] = useState(false);
  const [itemLoadingIds, setItemLoadingIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const unreadCount = data?.data.filter((n) => !n.read).length || 0;

  const addItemLoading = (id: number) => setItemLoadingIds((s) => Array.from(new Set([...s, id])));
  const removeItemLoading = (id: number) => setItemLoadingIds((s) => s.filter((x) => x !== id));
  const addDeleting = (id: number) => setDeletingIds((s) => Array.from(new Set([...s, id])));
  const removeDeleting = (id: number) => setDeletingIds((s) => s.filter((x) => x !== id));

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = data?.data.filter((n) => !n.read) || [];
      const unreadIds = unreadNotifications.map((n) => n.id);

      if (unreadIds.length === 0) return;

      setBulkLoading(true);
      await axios.patch("/api/notifications/bulk", {
        ids: unreadIds,
        read: true,
      });

      // Re-fetch
      await mutate();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      addItemLoading(id);

      await axios.patch(`/api/notifications/${id}`, { read: true });

      // Re-fetch
      await mutate();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      removeItemLoading(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      addDeleting(id);

      await axios.delete(`/api/notifications/${id}`);

      await mutate();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      removeDeleting(id);
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS":
        return "!bg-green-100 text-green-800 dark:!bg-green-900 dark:text-green-200";
      case "WARNING":
        return "!bg-yellow-100 text-yellow-800 dark:!bg-yellow-900 dark:text-yellow-200";
      case "ERROR":
        return "!bg-red-100 text-red-800 dark:!bg-red-900 dark:text-red-200";
      default:
        return "!bg-blue-100 text-blue-800 dark:!bg-blue-900 dark:text-blue-200";
    }
  };

  const getTypeBorder = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS":
        return "border-l-4 border-green-500 dark:border-green-400";
      case "WARNING":
        return "border-l-4 border-yellow-500 dark:border-yellow-400";
      case "ERROR":
        return "border-l-4 border-red-500 dark:border-red-400";
      default:
        return "border-l-4 border-blue-500 dark:border-blue-400";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("open notifications") as string}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className="top-0 right-0 absolute flex justify-center items-center w-4 h-4 rounded-full bg-red-500 text-[10px] text-white"
              aria-live="polite"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>{t("title")}</span>

            <div className="flex items-center gap-2">
              {/* show tiny updating indicator when SWR is validating in background */}
              {isValidating && (
                <div className="flex items-center mr-1 text-muted-foreground text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-1">{t("updating")}</span>
                </div>
              )}

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      {t("marking")}
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4 mr-1" />
                      {t("mark all as read")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
          {isLoading && (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              ))}
            </>
          )}

          {error && <div className="py-8 text-muted-foreground text-center">{t("errorLoading")}</div>}

          {data && data.data.length === 0 && (
            <div className="p-8 text-center">
              <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{t("no notifications found")}</h3>
              <p className="mb-4 text-muted-foreground text-sm">{t("try adjusting your search or filters")}</p>
            </div>
          )}

          {data?.data.map((notification) => {
            const isUnread = !notification.read;
            const containerClass = cn(
              "relative p-3 border rounded-lg transition-colors",
              isUnread ? `bg-muted/60 ${getTypeBorder(notification.type)} font-medium` : "bg-transparent opacity-70"
            );

            return (
              <div key={notification.id} className={containerClass}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn("text-xs", getTypeColor(notification.type))}>{notification.type}</Badge>
                  <div
                    className={cn("text-muted-foreground text-xs", isUnread && "text-slate-700 dark:text-slate-200")}
                  >
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </div>

                  <div className="flex items-center gap-1 ms-auto">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={itemLoadingIds.includes(notification.id)}
                        aria-label={t("mark as read") as string}
                      >
                        {itemLoadingIds.includes(notification.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deletingIds.includes(notification.id)}
                      aria-label={t("delete notification") as string}
                    >
                      {deletingIds.includes(notification.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {notification.title && (
                  <h4
                    className={cn(
                      "mb-1 text-[13px]",
                      isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-700"
                    )}
                  >
                    {notification.title}
                  </h4>
                )}

                <p
                  className={cn(
                    "mb-1 text-muted-foreground text-xs",
                    isUnread ? "text-slate-800" : "text-muted-foreground"
                  )}
                >
                  {notification.message}
                </p>

                {notification.link && (
                  <Link
                    href={notification.link}
                    className="text-primary text-xs hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {t("view details")}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

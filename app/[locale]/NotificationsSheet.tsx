"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, X } from "lucide-react";
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

  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    ["notifications"],
    () => fetcher(1, 20, "", "all", "createdAt", "desc"),
    {
      revalidateOnFocus: false,
    }
  );

  const unreadCount = data?.data.filter((n) => !n.read).length || 0;

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = data?.data.filter((n) => !n.read) || [];

      await Promise.all(
        unreadNotifications.map((notification) => axios.patch(`/api/notifications/${notification.id}`, { read: true }))
      );

      mutate();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.patch(`/api/notifications/${id}`, { read: true });
      mutate();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      mutate();
    } catch (error) {
      console.error("Failed to delete notification:", error);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="top-0 right-0 absolute flex justify-center items-center w-4 h-4 rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>{t("title")}</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                <CheckCheck className="w-4 h-4 mr-1" />
                {t("mark all as read")}
              </Button>
            )}
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

          {data?.data.map((notification) => (
            <div
              key={notification.id}
              className={cn("relative p-3 border rounded-lg transition-colors", !notification.read && "bg-muted/50")}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", getTypeColor(notification.type))}>{notification.type}</Badge>
                <div className="text-muted-foreground text-xs">
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
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleDelete(notification.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {notification.title && <h4 className="mb-1 font-semibold text-[13px]">{notification.title}</h4>}

              <p className={cn("mb-1 text-muted-foreground text-xs", "")}>{notification.message}</p>

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
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

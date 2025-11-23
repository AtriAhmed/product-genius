"use client";

import { User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";

type UsersDataTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading: boolean;
};

export default function UsersDataTable({ users, onEdit, onDelete, isLoading }: UsersDataTableProps) {
  const t = useTranslations("users");

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "!bg-purple-100 text-purple-800";
      case "ADMIN":
        return "!bg-red-100 text-red-800";
      case "EDITOR":
        return "!bg-blue-100 text-blue-800";
      case "AGENT":
        return "!bg-green-100 text-green-800";
      case "USER":
        return "!bg-gray-100 text-gray-800";
      default:
        return "!bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionStatus = (subscription: any) => {
    if (!subscription) return t("no subscription");

    const status = subscription.status?.toLowerCase();
    switch (status) {
      case "active":
        return t("active");
      case "trialing":
        return t("trialing");
      case "past_due":
        return t("past due");
      case "canceled":
        return t("canceled");
      default:
        return t("inactive");
    }
  };

  const getSubscriptionColor = (subscription: any) => {
    if (!subscription) return "!bg-gray-100 text-gray-800";

    const status = subscription.status?.toLowerCase();
    switch (status) {
      case "active":
        return "!bg-green-100 text-green-800";
      case "trialing":
        return "!bg-blue-100 text-blue-800";
      case "past_due":
        return "!bg-yellow-100 text-yellow-800";
      case "canceled":
        return "!bg-red-100 text-red-800";
      default:
        return "!bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("subscription")}</TableHead>
              <TableHead>{t("created")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="w-24 h-4 rounded bg-muted animate-pulse" />
                  </div>
                </TableCell>
                <TableCell className="py-1">
                  <div className="w-32 h-4 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="py-1">
                  <div className="w-16 h-6 rounded-full bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="py-1">
                  <div className="w-20 h-6 rounded-full bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="py-1">
                  <div className="w-20 h-4 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="py-1">
                  <div className="flex justify-end gap-2">
                    <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                    <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                    <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 border rounded-lg bg-card text-center">
        <div className="text-muted-foreground text-lg">{t("no users found")}</div>
      </div>
    );
  }

  return (
    <div className="w-0 min-w-full border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead>{t("subscription")}</TableHead>
            <TableHead>{t("created")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="py-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || "—"}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-1 font-mono text-sm">{user.email}</TableCell>
              <TableCell className="py-1">
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </TableCell>
              <TableCell className="py-1">
                <div className="space-y-1">
                  <Badge className={getSubscriptionColor(user.currentSubscription)}>
                    {getSubscriptionStatus(user.currentSubscription)}
                  </Badge>
                  {user.currentSubscription?.plan?.name && (
                    <div className="text-muted-foreground text-xs">{user.currentSubscription.plan.name}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-1 text-muted-foreground text-sm">
                {user.createdAt
                  ? formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </TableCell>
              <TableCell className="py-1">
                <div className="flex justify-end items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="p-2">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user)}
                    className="p-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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

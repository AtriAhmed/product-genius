"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Order } from "@/types";

type CustomerInformationProps = {
  order: Order;
  t: (key: string) => string;
};

export default function CustomerInformation({
  order,
  t,
}: CustomerInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t("customer information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {order.user.name?.charAt(0).toUpperCase() ||
                    order.user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {order.user.name || "Unknown Customer"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {order.user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-4 text-muted-foreground text-center">{t("n/a")}</p>
        )}
      </CardContent>
    </Card>
  );
}

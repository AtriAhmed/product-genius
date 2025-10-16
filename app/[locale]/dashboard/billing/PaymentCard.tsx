"use client";

import { PaymentMethod } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, CreditCard, Trash2, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { getCardBackground, getCardIconPath } from "@/lib/billingUtils";
import Image from "next/image";

type PaymentCardProps = {
  paymentMethod: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
};

export default function PaymentCard({
  paymentMethod,
  onSetDefault,
  onDelete,
}: PaymentCardProps) {
  const t = useTranslations("billing");

  return (
    <Card
      className={`py-1.5 relative overflow-hidden ${getCardBackground(
        paymentMethod.card?.brand || "unknown"
      )} min-h-[140px] w-full sm:w-fit sm:min-w-[200px] grow sm:max-w-[250px] flex flex-col justify-between transition-all duration-200 hover:scale-[1.01]`}
    >
      <CardContent className="p-2.5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-0.5 shrink-0">
          <div className="text-[10px] font-medium opacity-90">
            {paymentMethod.card?.brand?.toUpperCase() || "CARD"}
          </div>
          <div className="flex items-center gap-1">
            {paymentMethod.isDefault && (
              <Badge
                variant="secondary"
                className="bg-white/25 text-white border-white/30 text-[8px]"
              >
                {t("default")}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-white/20"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* {!paymentMethod.isDefault && (
                  <DropdownMenuItem
                    onClick={() => onSetDefault(paymentMethod.id)}
                    className="text-xs font-medium"
                  >
                    <Star className="mr-1.5 size-3" />
                    {t("set as default")}
                  </DropdownMenuItem>
                )} */}
                <DropdownMenuItem
                  className="!text-destructive text-xs font-medium"
                  onClick={() => onDelete(paymentMethod)}
                >
                  <Trash2 className="mr-1.5 size-3 text-current" />
                  {t("delete card")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chip */}
        <div className="mb-2">
          <div className="w-6 h-4 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90 shadow-sm" />
        </div>

        {/* Card number */}
        <div className="flex-1 flex items-center">
          <div className="text-[11px] font-mono tracking-wider">
            •••• •••• •••• {paymentMethod.card?.last4}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-1 shrink-0">
          <div>
            <div className="text-[9px] opacity-70 mb-0.5">{t("expires")}</div>
            <div className="text-[11px] font-medium leading-tight">
              {String(paymentMethod.card?.expMonth).padStart(2, "0")}/
              {paymentMethod.card?.expYear.toString().slice(-2)}
            </div>
          </div>
          <div className="opacity-90">
            <Image
              src={getCardIconPath(paymentMethod.card?.brand || "unknown")}
              alt={paymentMethod.card?.brand || "Card"}
              height={24}
              width={24}
              className="object-contain rounded-xs"
            />
          </div>
        </div>
      </CardContent>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-white">
          <circle cx="70" cy="30" r="30" fill="currentColor" />
          <circle cx="30" cy="70" r="20" fill="currentColor" />
        </svg>
      </div>
    </Card>
  );
}

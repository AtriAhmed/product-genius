"use client";

import { PaymentMethod } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, CreditCard, Trash2, Star, Loader2 } from "lucide-react";
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
  isSettingDefault?: boolean;
};

export default function PaymentCard({ paymentMethod, onSetDefault, onDelete, isSettingDefault }: PaymentCardProps) {
  const t = useTranslations("billing");

  return (
    <Card
      className={`py-1.5 relative overflow-hidden ${getCardBackground(
        paymentMethod.card?.brand || "unknown"
      )} min-h-[140px] w-full sm:w-fit sm:min-w-[200px] grow sm:max-w-[250px] flex flex-col justify-between transition-all duration-200 hover:scale-[1.01]`}
    >
      {isSettingDefault && (
        <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/10 backdrop-blur-[2px]">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      <CardContent className="flex flex-col h-full p-2.5">
        {/* Header */}
        <div className="flex justify-between items-start mb-0.5 shrink-0">
          <div className="opacity-90 font-medium text-[10px]">{paymentMethod.card?.brand?.toUpperCase() || "CARD"}</div>
          <div className="flex items-center gap-1">
            {paymentMethod.isDefault && (
              <Badge variant="secondary" className="border-white/30 bg-white/25 text-[8px] text-white">
                {t("default")}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/20">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!paymentMethod.isDefault && (
                  <DropdownMenuItem onClick={() => onSetDefault(paymentMethod.id)} className="font-medium text-xs">
                    <Star className="size-3 mr-1.5" />
                    {t("set as default")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="font-medium !text-destructive text-xs"
                  onClick={() => onDelete(paymentMethod)}
                >
                  <Trash2 className="size-3 mr-1.5 text-current" />
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
        <div className="flex flex-1 items-center">
          <div className="font-mono text-[11px] tracking-wider">•••• •••• •••• {paymentMethod.card?.last4}</div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-1 shrink-0">
          <div>
            <div className="mb-0.5 opacity-70 text-[9px]">{t("expires")}</div>
            <div className="font-medium text-[11px] leading-tight">
              {String(paymentMethod.card?.expMonth).padStart(2, "0")}/{paymentMethod.card?.expYear.toString().slice(-2)}
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
      <div className="top-0 right-0 absolute w-20 h-20 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-white">
          <circle cx="70" cy="30" r="30" fill="currentColor" />
          <circle cx="30" cy="70" r="20" fill="currentColor" />
        </svg>
      </div>
    </Card>
  );
}

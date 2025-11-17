"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Check } from "lucide-react";
import { useTranslations } from "next-intl";

type DeleteMappingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deleteFromShopify: boolean) => void;
  isLoading?: boolean;
  productTitle?: string;
};

export default function DeleteMappingDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  productTitle,
}: DeleteMappingDialogProps) {
  const t = useTranslations("imported-products");
  const [deleteFromShopify, setDeleteFromShopify] = useState(true);

  const handleConfirm = () => {
    onConfirm(deleteFromShopify);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      setDeleteFromShopify(true);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-black/25"
        className="border border-border dark:border-white/10 bg-background shadow-lg dark:shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("delete imported product")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {productTitle
              ? t("are you sure delete mapping for", { product: productTitle })
              : t("are you sure delete mapping")}
          </p>

          <div className="flex items-start gap-2 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
            <div className="text-sm">
              <p className="mb-1 font-medium text-red-800 dark:text-red-200">{t("warning")}</p>
              <p className="text-red-700 dark:text-red-300">{t("this action cannot be undone")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <button
              type="button"
              role="checkbox"
              aria-checked={deleteFromShopify}
              disabled={isLoading}
              onClick={() => setDeleteFromShopify(!deleteFromShopify)}
              className={`
                flex items-center justify-center w-5 h-5 border-2 rounded transition-colors
                ${
                  deleteFromShopify
                    ? "bg-red-500 border-red-500"
                    : "bg-background border-muted-foreground/30 hover:border-muted-foreground/50"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {deleteFromShopify && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </button>
            <label
              onClick={() => !isLoading && setDeleteFromShopify(!deleteFromShopify)}
              className={`text-sm font-medium leading-none ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {t("delete from shopify as well")}
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} variant="destructive">
            {isLoading ? "Loading..." : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

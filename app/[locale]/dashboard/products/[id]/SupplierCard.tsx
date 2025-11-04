import {
  Building2,
  ExternalLink,
  Store,
  Star,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Supplier } from "@/types";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SupplierCardProps {
  productId?: number;
  price: number;
  compareAtPrice?: number;
  compact?: boolean;
  isImported?: boolean;
}

export default function SupplierCard({
  productId,
  price,
  compareAtPrice,
  compact = true,
  isImported = false,
}: SupplierCardProps) {
  const router = useRouter();
  const t = useTranslations("shopify");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportToShopify = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmImport = async () => {
    if (!productId) return;

    setIsImporting(true);

    try {
      const response = await axios.post(
        `/api/products/${productId}/import-to-shopify`
      );
      toast.success("Product successfully imported to Shopify!");
      router.push("/dashboard/imported-products");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to import product to Shopify"
      );
    } finally {
      setIsImporting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden !p-2 bg-gradient-to-br from-white dark:from-gray-900 via-primary/5 dark:via-primary/10 to-primary/10 dark:to-primary/20 shadow-sm transition-shadow duration-300">
      <CardContent className="flex flex-col space-y-2.5 h-full !p-2">
        {/* Header: Marketplace + Star */}
        <div className="flex items-center gap-2.5">
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary-500 shadow-md shadow-primary-500/30">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-foreground text-sm truncate">
                {"WinWaterfall"}
              </h4>
              <div className="flex items-center gap-1">
                <Star
                  className="flex-shrink-0 w-3.5 h-3.5 drop-shadow-sm text-yellow-400"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="min-w-0 font-semibold text-primary-700 dark:text-primary-300 text-xs truncate">
          {supplier?.notes}
        </div> */}

        {/* Price & Domain Row */}
        <div className="flex justify-between items-center gap-2 mt-auto">
          {/* Enhanced Price Badge */}
          <div
            className={`rounded-lg px-2.5 py-1.5 flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 dark:shadow-primary-800/40`}
          >
            <div className="flex items-center gap-1">
              <span className="drop-shadow-sm font-bold text-white text-xs">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>

        {/* Import to Shopify Button */}
        <Button
          size="sm"
          variant={isImported ? "secondary" : "primary"}
          onClick={handleImportToShopify}
          disabled={isImporting || isImported}
          className={`disabled:opacity-90 w-full h-7 px-3 text-xs transition-all duration-200 ${
            isImported
              ? "bg-primary-700 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-primary-600 to-primary-700 shadow-md hover:shadow-lg hover:saturate-75"
          }`}
        >
          {isImporting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isImported ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Store className="w-3 h-3" />
          )}
          {isImporting
            ? "Importing..."
            : isImported
            ? "Already Imported"
            : "Import to Shopify"}
        </Button>
      </CardContent>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Import to Shopify"
        description="Are you sure you want to import this product to your Shopify store?"
        alertTitle="Product Import"
        alertMessage="This action will create a new product in your connected Shopify store."
        confirmText="Import Product"
        cancelText="Cancel"
        onConfirm={handleConfirmImport}
        variant="info"
        isLoading={isImporting}
      />
    </Card>
  );
}

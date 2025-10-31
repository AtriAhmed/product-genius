"use client";

import ShopifyIcon from "@/assets/images/shopify.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Loader2, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type ShopifyConnectionFormProps = {
  onConnect: () => void;
};

export default function ShopifyConnectionForm({
  onConnect,
}: ShopifyConnectionFormProps) {
  const t = useTranslations("shopify");
  const [shopDomain, setShopDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConnectShopify = () => {
    if (!shopDomain.trim()) {
      toast.error(t("enter domain"));
      return;
    }

    // Validate domain format
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*$/;
    if (!shopRegex.test(shopDomain)) {
      toast.error(t("invalid domain"));
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmConnection = async () => {
    setIsConnecting(true);
    setShowConfirmDialog(false);

    try {
      const fullShopDomain = `${shopDomain}.myshopify.com`;
      window.location.href = `/api/shopify/auth?shop=${fullShopDomain}`;
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("connection failed"));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-primary" />
          <CardTitle>{t("connect store")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Form */}
        <div className="space-y-6">
          <div className="py-6 text-center">
            <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-lg bg-[#95BF47]">
              <ShopifyIcon className="text-white" width={30} />
            </div>
            <h3 className="mb-2 font-semibold text-xl">{t("connect store")}</h3>
            <p className="max-w-md mx-auto text-muted-foreground">
              {t("connection description")}
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <label htmlFor="shop-domain" className="font-medium text-sm">
                {t("store domain")}
              </label>
              <div className="relative">
                <Input
                  id="shop-domain"
                  type="text"
                  placeholder={t("domain placeholder")}
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  className="pr-32"
                  disabled={isConnecting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConnectShopify();
                    }
                  }}
                />
                <div className="top-1/2 right-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none">
                  .myshopify.com
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {t("domain help")}
              </p>
            </div>

            <Button
              onClick={handleConnectShopify}
              className="w-full bg-[#95BF47] hover:bg-[#7FA03B] text-white"
              disabled={isConnecting || !shopDomain.trim()}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("connecting")}
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 mr-2" />
                  {t("connect button")}
                </>
              )}
            </Button>
          </div>

          <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <h4 className="mb-2 font-medium text-sm">
              {t("what happens next")}
            </h4>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• {t("step 1")}</li>
              <li>• {t("step 2")}</li>
              <li>• {t("step 3")}</li>
            </ul>
          </div>
        </div>
      </CardContent>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={t("confirm connection")}
        description={t("confirm connection description")}
        alertTitle={t("connecting to")}
        alertMessage={`${shopDomain}.myshopify.com`}
        confirmText={t("connect button")}
        cancelText={t("cancel")}
        onConfirm={handleConfirmConnection}
        variant="info"
        isLoading={isConnecting}
      />
    </Card>
  );
}

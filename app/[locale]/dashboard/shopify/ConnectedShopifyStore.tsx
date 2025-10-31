"use client";

import ShopifyIcon from "@/assets/images/shopify.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import type { ShopifyStore } from "@/types";
import axios from "axios";
import {
  ExternalLink,
  Unlink,
  Store,
  Upload,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type ConnectedShopifyStoreProps = {
  shopifyStore: ShopifyStore;
  onDisconnect: () => void;
};

export default function ConnectedShopifyStore({
  shopifyStore,
  onDisconnect,
}: ConnectedShopifyStoreProps) {
  const t = useTranslations("shopify");
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const handleUnlinkShopify = async () => {
    setIsUnlinking(true);
    try {
      await axios.delete(`/api/shopify/${shopifyStore.id}`);
      toast.success(t("store disconnected"));
      onDisconnect();
      setShowUnlinkDialog(false);
    } catch (error: any) {
      console.error("Error unlinking Shopify store:", error);
      toast.error(error.response?.data?.error || t("disconnect failed"));
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Connected Store Card */}
        <Card className="bg-background">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-primary" />
              <CardTitle>{t("connected store")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Store Info */}
            <div className="flex justify-between items-center p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-4">
                <div className="flex justify-center w-12 h-12 rounded-lg bg-[#95BF47]">
                  <ShopifyIcon className="text-white" width={25} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {shopifyStore.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="!bg-green-100 !dark:bg-green-900 text-green-800 dark:text-green-100"
                    >
                      {t("connected")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>{shopifyStore.shop}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`https://${shopifyStore.shop}/admin`, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t("open admin")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowUnlinkDialog(true)}
                  className="hover:bg-red-700 text-white"
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  {t("disconnect")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="bg-background">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle>{t("next steps title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="gap-4 grid md:grid-cols-1 lg:grid-cols-1">
                {/* Step 1: Import Products */}
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-full bg-blue-600 font-semibold text-white text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium">
                          {t("import products title")}
                        </h5>
                      </div>
                      <p className="mb-3 text-muted-foreground text-sm">
                        {t("import products description")}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/products">
                          {t("go to products")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Setup */}
                <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-full bg-orange-600 font-semibold text-white text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        <h5 className="font-medium">
                          {t("payment setup title")}
                        </h5>
                      </div>
                      <p className="mb-3 text-muted-foreground text-sm">
                        {t("payment setup description")}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/billing">
                          {t("manage payment methods")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Step 3: Order Processing */}
                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-full bg-purple-600 font-semibold text-white text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-purple-600" />
                        <h5 className="font-medium">
                          {t("order processing title")}
                        </h5>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {t("order processing description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex justify-center items-center w-6 h-6 rounded-full bg-yellow-600 text-white">
                      !
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1 font-medium text-yellow-800 dark:text-yellow-200">
                      {t("important note title")}
                    </h5>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {t("important note description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={showUnlinkDialog}
        onOpenChange={setShowUnlinkDialog}
        title={t("disconnect store")}
        description={t("disconnect description")}
        alertMessage={t("disconnect warning")}
        confirmText={t("disconnect")}
        cancelText={t("cancel")}
        onConfirm={handleUnlinkShopify}
        variant="destructive"
        isLoading={isUnlinking}
      />
    </>
  );
}

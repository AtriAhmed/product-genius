"use client";

import type { User } from "@/types";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import ConnectedShopifyStore from "./ConnectedShopifyStore";
import ShopifyConnectionForm from "./ShopifyConnectionForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";

async function fetcher(): Promise<User> {
  const response = await axios.get("/api/users/current");
  return response.data;
}

export default function ShopifyPage() {
  const t = useTranslations("shopify");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    const shopifyConnected = searchParams.get("shopify_connected");

    if (shopifyConnected === "true") {
      toast.success(t("store connected successfully"));
      router.replace("/dashboard/shopify");
    } else if (error) {
      switch (error) {
        case "not_authenticated":
          toast.error(t("not authenticated"));
          break;
        case "missing_params":
          toast.error(t("missing parameters"));
          break;
        case "store_already_connected":
          toast.error(t("store already connected"));
          break;
        case "auth_failed":
          toast.error(t("authentication failed"));
          break;
        default:
          toast.error(t("connection error"));
      }
      router.replace("/dashboard/shopify");
    }
  }, [searchParams]);

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>("current-user", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const shopifyStore = user?.shopifyStores?.[0];

  const handleDisconnect = () => {
    mutate(); // Refresh user data after disconnection
  };

  const handleConnect = () => {
    mutate(); // Refresh user data after connection
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="mb-2 font-semibold text-lg">{t("error loading")}</h3>
          <p className="text-muted-foreground">{t("refresh message")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="w-48 h-8 rounded bg-muted animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="w-64 h-6 rounded bg-muted animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full h-4 rounded bg-muted animate-pulse" />
              <div className="w-3/4 h-4 rounded bg-muted animate-pulse" />
              <div className="w-full h-10 rounded bg-muted animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">{t("shopify integration")}</h1>
        <p className="mt-2 text-muted-foreground">{t("manage your shopify store connection")}</p>
      </div>

      {/* Main Content */}
      {shopifyStore ? (
        <ConnectedShopifyStore shopifyStore={shopifyStore} onDisconnect={handleDisconnect} />
      ) : (
        <ShopifyConnectionForm onConnect={handleConnect} />
      )}
    </div>
  );
}

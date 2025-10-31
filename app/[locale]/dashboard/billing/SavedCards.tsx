"use client";

import { useState } from "react";
import useSWR from "swr";
import { PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import axios from "axios";
import PaymentCard from "./PaymentCard";
import AddPaymentMethodDialog from "./AddPaymentMethodDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";

type SavedCardsResponse = {
  paymentMethods: PaymentMethod[];
};

async function fetcher(): Promise<SavedCardsResponse> {
  const response = await axios.get("/api/stripe/cards");
  return response.data;
}

export default function SavedCards() {
  const t = useTranslations("billing");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteCard, setDeleteCard] = useState<PaymentMethod | undefined>();
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<SavedCardsResponse>(
    "payment-methods",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const paymentMethods = data?.paymentMethods || [];

  if (error) {
    toast.error("Failed to load payment methods");
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await axios.post("/api/stripe/cards", {
        paymentMethodId,
        setAsDefault: true,
      });
      toast.success(t("card set default"));
      mutate();
    } catch (error: any) {
      console.error("Error setting default card:", error);
      toast.error(error.response?.data?.error || "Failed to set default card");
    }
  };

  const handleDelete = (paymentMethod: PaymentMethod) => {
    setDeleteCard(paymentMethod);
  };

  const confirmDelete = async () => {
    if (!deleteCard) return;

    setIsDeletingCard(true);
    try {
      await axios.delete(`/api/stripe/cards/${deleteCard.id}`);
      toast.success(t("card deleted"));
      mutate();
    } catch (error: any) {
      console.error("Error deleting card:", error);
      toast.error(error.response?.data?.error || "Failed to delete card");
    } finally {
      setDeleteCard(undefined);
    }
    setIsDeletingCard(false);
  };

  const handleAddSuccess = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t("saved cards")}
            </CardTitle>
            <Button disabled>
              <Plus className="w-4 h-4 mr-2" />
              {t("add new card")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 aspect-[1.6/1] rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t("saved cards")}
            </CardTitle>
          </div>
          <Button
            className="ms-auto"
            onClick={() => setShowAddDialog(true)}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("add new card")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-lg">{t("no cards")}</h3>
            <p className="mb-4 text-muted-foreground">{t("add first card")}</p>
            <Button onClick={() => setShowAddDialog(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              {t("add new card")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {paymentMethods.map((paymentMethod) => (
              <PaymentCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>

      <AddPaymentMethodDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />

      <ConfirmationDialog
        open={!!deleteCard}
        onOpenChange={() => setDeleteCard(undefined)}
        title={t("delete card")}
        description={t("confirm delete")}
        alertMessage={t("delete warning")}
        confirmText={t("delete card")}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
        isLoading={isDeletingCard}
      />
    </Card>
  );
}

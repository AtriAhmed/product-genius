"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  CardNumberElementProps,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

type AddPaymentMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export default function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodDialogProps) {
  const t = useTranslations("billing");
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setIsLoading(true);
    try {
      // Create setup intent
      const { data } = await axios.post("/api/stripe/cards/setup-intent");

      // Confirm setup intent with full card details
      const { error } = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("card added"));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding card:", error);
      toast.error(error.response?.data?.error || "Failed to add card");
    } finally {
      setIsLoading(false);
    }
  };

  const elementStyle: CardNumberElementProps["options"] = {
    iconStyle: "solid" as const,
    style: {
      base: {
        fontSize: "16px",
        color: theme === "dark" ? "#E5E7EB" : "#1F2937",
        "::placeholder": {
          color: theme === "dark" ? "#9CA3AF" : "#6B7280",
        },
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      invalid: {
        color: "#EF4444",
      },
    },
  };

  const cardNumberStyle: CardNumberElementProps["options"] = {
    ...elementStyle,
    showIcon: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add new card")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Number</label>
            <div className="p-3 border border-input rounded-md bg-background">
              <CardNumberElement options={cardNumberStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry</label>
              <div className="p-3 border border-input rounded-md bg-background">
                <CardExpiryElement options={elementStyle} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CVC</label>
              <div className="p-3 border border-input rounded-md bg-background">
                <CardCvcElement options={elementStyle} />
              </div>
            </div>
          </div>

          {/* <div className="flex items-center space-x-2">
            <input
              id="setAsDefault"
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="setAsDefault" className="text-sm font-medium">
              {t("set as default")}
            </label>
          </div> */}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !stripe || !elements}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Adding..." : "Add Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Invoice, PaymentMethod } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft, Zap, Shield, FileText, CreditCard } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InvoiceReviewStep from "@/app/[locale]/dashboard/invoices/InvoiceReviewStep";
import InvoicePaymentStep from "@/app/[locale]/dashboard/invoices/InvoicePaymentStep";
import { cn } from "@/lib/utils";
import { mutate } from "swr";

import { toast } from "sonner";

type Props = {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
};

type Step = "review" | "payment" | "processing";

export default function PayInvoiceDialog({ invoice, isOpen, onClose }: Props) {
  const t = useTranslations("invoices");
  const router = useRouter();
  const [step, setStep] = useState<Step>("review");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingCards, setLoadingCards] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("review");
      setSelectedPaymentMethod("");
      setError("");
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    setLoadingCards(true);
    try {
      const response = await axios.get("/api/stripe/cards");
      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);

      // Auto-select default payment method
      const defaultMethod = methods.find((pm: PaymentMethod) => pm.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setError("Failed to load payment methods");
    } finally {
      setLoadingCards(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!invoice || !selectedPaymentMethod) return;

    setLoading(true);
    setError("");
    setStep("processing");

    try {
      const response = await axios.post(`/api/invoices/${invoice.id}/pay`);

      setTimeout(() => {
        router.refresh();
        mutate("invoices");
        onClose();
        toast.success("Invoice paid successfully");
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.response?.data?.error || "Failed to pay invoice");
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setStep("payment");
  };

  const handleBack = () => {
    setStep("review");
    setError("");
  };

  const navigateToBilling = () => {
    onClose();
    router.push("/dashboard/billing");
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[800px] overflow-hidden mx-auto border-2 border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 dark:from-neutral-900 via-primary-100 dark:via-primary-950 to-primary-200 dark:to-primary-900 shadow-2xl",
          step !== "processing" && "h-[calc(100dvh-40px)]"
        )}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="-top-20 -right-20 absolute w-40 h-40 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 blur-3xl animate-pulse"></div>
          <div
            className="-bottom-20 -left-20 absolute w-40 h-40 rounded-full bg-gradient-to-tr from-primary-500 to-primary-700 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="flex flex-col">
          <DialogHeader className="z-10 relative space-y-2">
            <div className="flex justify-between items-center">
              {step === "payment" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="w-8 h-8 p-0 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 hover:scale-110 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </Button>
              )}
              <div className="flex-1 text-center">
                <DialogTitle className="flex justify-center items-center gap-2 bg-clip-text bg-gradient-to-r from-primary-600 dark:from-primary-400 via-primary-600 dark:via-primary-400 to-primary-700 dark:to-primary-500 font-bold text-transparent text-lg">
                  {step === "review" && (
                    <>
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      Pay Invoice
                    </>
                  )}
                  {step === "payment" && (
                    <>
                      <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      Select Payment Method
                    </>
                  )}
                  {step === "processing" && (
                    <>
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                      Processing
                    </>
                  )}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="z-10 relative flex-1 space-y-4 mt-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-2 border-red-300 dark:border-red-700 bg-gradient-to-r dark:bg-gradient-to-r from-red-50 dark:from-red-950/50 to-pink-50 dark:to-pink-950/50 shadow-lg">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="font-medium text-red-900 dark:text-red-200 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Review Step */}
            {step === "review" && <InvoiceReviewStep invoice={invoice} onNext={handleNext} />}

            {/* Payment Step */}
            {step === "payment" && (
              <InvoicePaymentStep
                invoice={invoice}
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={setSelectedPaymentMethod}
                onPayInvoice={handlePayInvoice}
                loading={loading}
                loadingCards={loadingCards}
                onNavigateToBilling={navigateToBilling}
              />
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="space-y-4 py-8 text-center">
                <div className="flex justify-center items-center">
                  <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin" />
                </div>
                <div>
                  <h3 className="flex justify-center items-center gap-2 font-bold text-primary-900 dark:text-primary-100 text-base">
                    <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    Processing your payment...
                  </h3>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs">Please don't close this window</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

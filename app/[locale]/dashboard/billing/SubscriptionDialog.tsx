import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plan, PaymentMethod } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReviewStep from "./ReviewStep";
import PaymentStep from "./PaymentStep";
import { cn } from "@/lib/utils";

type Props = {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
};

type Step = "review" | "payment" | "processing";

export default function SubscriptionDialog({ plan, isOpen, onClose }: Props) {
  const t = useTranslations("pricing");
  const router = useRouter();
  const [step, setStep] = useState<Step>("review");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
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
      setError(t("failed to load payment methods"));
    } finally {
      setLoadingCards(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan || !selectedPaymentMethod) return;

    setLoading(true);
    setError("");
    setStep("processing");

    try {
      const response = await axios.post("/api/subscriptions", {
        planId: plan.id,
        paymentMethodId: selectedPaymentMethod,
      });

      // Success - close dialog and refresh
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error("Subscription error:", error);
      setError(
        error.response?.data?.error || t("failed to create subscription")
      );
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (paymentMethods.length === 0) {
      setError(t("please add a payment method first"));
      return;
    }
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

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-md mx-auto bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-neutral-900 dark:via-primary-950 dark:to-primary-900 border-2 border-primary-300 dark:border-primary-700 shadow-2xl overflow-hidden",
          step !== "processing" && "h-[calc(100dvh-40px)]"
        )}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-primary-500 to-primary-700 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="flex flex-col">
          <DialogHeader className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              {step === "payment" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 w-8 p-0 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-full transition-all hover:scale-110"
                >
                  <ArrowLeft className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </Button>
              )}
              <div className="flex-1 text-center">
                <DialogTitle className="text-lg font-bold bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-400 dark:to-primary-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  {step === "review" && (
                    <>
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                      {t("subscribe to plan")}
                    </>
                  )}
                  {step === "payment" && (
                    <>
                      <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      {t("select payment method")}
                    </>
                  )}
                  {step === "processing" && (
                    <>
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                      {t("processing")}
                    </>
                  )}
                </DialogTitle>
              </div>
              {plan.mostPopular && (
                <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg flex items-center gap-1 px-3 py-1 animate-pulse">
                  <Crown className="w-3 h-3 fill-yellow-200" />
                  {t("popular")}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-4 relative z-10 mt-6">
            {/* Error Alert */}
            {/* {error && (
              <Alert className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 dark:border-red-700 dark:bg-gradient-to-r dark:from-red-950/50 dark:to-pink-950/50 shadow-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-900 dark:text-red-200 text-sm font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )} */}

            {/* Review Step */}
            {step === "review" && (
              <ReviewStep plan={plan} onNext={handleNext} />
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <PaymentStep
                plan={plan}
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={setSelectedPaymentMethod}
                onSubscribe={handleSubscribe}
                loading={loading}
                loadingCards={loadingCards}
                onNavigateToBilling={navigateToBilling}
              />
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary-900 dark:text-primary-100 flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    {t("creating your subscription")}...
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {t("please don't close this window")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

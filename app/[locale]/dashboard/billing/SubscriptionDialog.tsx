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
          "max-w-md overflow-hidden mx-auto border-2 border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 dark:from-neutral-900 via-primary-100 dark:via-primary-950 to-primary-200 dark:to-primary-900 shadow-2xl",
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
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 animate-pulse" />
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
                <Badge className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg text-white animate-pulse">
                  <Crown className="w-3 h-3 fill-yellow-200" />
                  {t("popular")}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="z-10 relative flex-1 space-y-4 mt-6">
            {/* Error Alert */}
            {/* {error && (
              <Alert className="border-2 border-red-300 dark:border-red-700 bg-gradient-to-r dark:bg-gradient-to-r from-red-50 dark:from-red-950/50 to-pink-50 dark:to-pink-950/50 shadow-lg">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="font-medium text-red-900 dark:text-red-200 text-sm">
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
              <div className="space-y-4 py-8 text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 animate-pulse"></div>
                  <div className="absolute inset-2 flex justify-center items-center rounded-full bg-white dark:bg-neutral-900">
                    <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="flex justify-center items-center gap-2 font-bold text-primary-900 dark:text-primary-100 text-base">
                    <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    {t("creating your subscription")}...
                  </h3>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs">
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

"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import SavedCards from "@/app/[locale]/dashboard/billing/SavedCards";
import PlansList from "@/app/[locale]/dashboard/billing/PlansList";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BillingPage() {
  const t = useTranslations("billing");

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 py-2 space-y-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("billing")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("payment methods")}</p>
          </div>

          {/* Saved Cards Section */}
          <SavedCards />

          {/* Available Plans Section */}
          <PlansList />
        </div>
      </div>
    </Elements>
  );
}

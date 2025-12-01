"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import CurrentSubscription from "@/app/[locale]/dashboard/billing/CurrentSubscription";
import SavedCards from "@/app/[locale]/dashboard/billing/SavedCards";
import PlansList from "@/app/[locale]/dashboard/billing/PlansList";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
  const t = useTranslations("billing");

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-background">
        <div className="space-y-2 mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-foreground text-3xl">{t("billing")}</h1>
            <p className="mt-2 text-muted-foreground">{t("payment methods")}</p>
          </div>

          {/* Current Subscription Section */}
          <CurrentSubscription />

          {/* Saved Cards Section */}
          <SavedCards />

          {/* Available Plans Section */}
          <PlansList />
        </div>
      </div>
    </Elements>
  );
}

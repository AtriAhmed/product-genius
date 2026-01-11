"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plan } from "@/types";
import PricingPlanCard from "./PricingPlanCard";

export default function PricingSection({ plans }: { plans: Plan[] }) {
  const t = useTranslations("pricing");

  const intervals = ["DAY", "WEEK", "MONTH", "YEAR"];
  const [activeInterval, setActiveInterval] = useState("MONTH");

  /* ------------------------------------------------------------------
   * Empty state (same idea as emptyStateRow)
   * ------------------------------------------------------------------ */
  const emptyState = (
    <div className="py-16 text-center">
      <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
        <Star className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground text-lg">{t("no plans available")}</h3>
      <p className="text-muted-foreground">{t("check back later for more options")}</p>
    </div>
  );

  /* ------------------------------------------------------------------
   * Data preparation (only runs when data exists)
   * ------------------------------------------------------------------ */
  const availableIntervals = intervals.filter((interval) =>
    plans.some((plan) => plan.prices?.some((price) => price.interval === interval && price.price != null))
  );

  const plansToDisplay = plans.filter((plan) =>
    plan.prices?.some((price) => price.interval === activeInterval && (price.price != null || plan.isFree))
  );

  const defaultInterval = availableIntervals[0] ?? "MONTH";

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (always rendered, just like table header) */}
        <div className="text-center">
          <h2 className="font-semibold text-primary-500 text-base uppercase tracking-wide" data-aos="fade-up">
            {t("pricing")}
          </h2>
          <p
            className="mt-2 font-extrabold text-foreground text-3xl sm:text-4xl tracking-tight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {t("simple transparent pricing")}
          </p>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-xl" data-aos="fade-up" data-aos-delay="200">
            {t("choose the plan that fits your business needs")}
          </p>
        </div>

        {/* Body */}
        {availableIntervals.length === 0 ? (
          emptyState
        ) : (
          <div className="w-full max-w-7xl mx-auto mt-8">
            <Tabs
              value={availableIntervals.includes(activeInterval) ? activeInterval : defaultInterval}
              onValueChange={setActiveInterval}
              className="w-full"
            >
              {availableIntervals.length > 1 && (
                <div className="flex justify-center mb-6" data-aos="fade-up" data-aos-delay="300">
                  <TabsList className="flex gap-2 w-auto h-auto px-2 py-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
                    {availableIntervals.map((interval) => (
                      <TabsTrigger
                        key={interval}
                        value={interval}
                        className="min-w-[80px] px-4 py-1 rounded-lg data-[state=active]:bg-primary-500! font-semibold data-[state=active]:text-white text-sm transition-all"
                      >
                        {t(interval.toLowerCase())}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}

              <div data-aos="fade-up" data-aos-delay="400">
                {availableIntervals.map((interval) => (
                  <TabsContent key={interval} value={interval}>
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-4">
                      {plansToDisplay.map((plan) => (
                        <PricingPlanCard key={plan.id} plan={plan} selectedInterval={interval} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

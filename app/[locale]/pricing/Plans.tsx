"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plan } from "@/types";
import PricingPlanCard from "./PricingPlanCard";

type PlansResponse = {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

async function fetcher(): Promise<PlansResponse> {
  const response = await axios.get("/api/plans", {
    params: {
      filter: "active",
      sortBy: "sortOrder",
      sortOrder: "asc",
      limit: 100,
    },
  });
  return response.data;
}

export default function PricingSection() {
  const t = useTranslations("pricing");
  const { data, error, isLoading } = useSWR<PlansResponse>(["plans", "active"], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const intervals = ["DAY", "WEEK", "MONTH", "YEAR"];
  const [activeInterval, setActiveInterval] = useState("MONTH");

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-semibold text-primary-500 text-base uppercase tracking-wide">{t("pricing")}</h2>
            <p className="mt-2 font-extrabold text-foreground text-3xl sm:text-4xl leading-8 tracking-tight">
              {t("simple transparent pricing")}
            </p>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-xl">
              {t("choose the plan that fits your business needs")}
            </p>
          </div>

          <div className="w-full max-w-7xl mx-auto mt-16">
            <div className="flex justify-center mb-12">
              <div className="grid grid-cols-4 p-2 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
                {intervals.map((interval) => (
                  <Skeleton key={interval} className="w-20 h-12 mx-1 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full h-[520px] rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-semibold text-primary-500 text-base uppercase tracking-wide">{t("pricing")}</h2>
            <p className="mt-2 font-extrabold text-foreground text-3xl sm:text-4xl leading-8 tracking-tight">
              {t("simple transparent pricing")}
            </p>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-xl">
              {t("choose the plan that fits your business needs")}
            </p>
          </div>
          <div className="py-8 text-muted-foreground text-center">{t("failed to load plans")}</div>
        </div>
      </div>
    );
  }

  const plans = data.data || [];

  const availableIntervals = intervals.filter((interval) => {
    return plans.some((plan) => plan.prices?.some((price) => price.interval === interval && !!price.price));
  });

  const plansToDisplay = plans.filter((plan) =>
    plan.prices?.some((price) => price.interval === activeInterval && (price.price != null || plan?.isFree))
  );

  const defaultInterval = availableIntervals.length > 0 ? availableIntervals[0] : "MONTH";

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-semibold text-primary-500 text-base uppercase tracking-wide">{t("pricing")}</h2>
          <p className="mt-2 font-extrabold text-foreground text-3xl sm:text-4xl leading-8 tracking-tight">
            {t("simple transparent pricing")}
          </p>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-xl">
            {t("choose the plan that fits your business needs")}
          </p>
        </div>

        <div className="w-full max-w-7xl mx-auto mt-8">
          <Tabs
            value={availableIntervals.includes(activeInterval as any) ? activeInterval : defaultInterval}
            onValueChange={setActiveInterval}
            className="w-full"
          >
            {availableIntervals.length > 1 && (
              <div className="flex justify-center mb-6">
                <TabsList
                  // className={`h-auto grid grid-cols-1 sm:grid-cols-[repeat(var(--cols),1fr)] gap-2 w-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-1 px-2 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 backdrop-blur-sm`}
                  // style={
                  //   {
                  //     "--cols": availableIntervals.length,
                  //   } as any
                  // }
                  className={`h-auto flex gap-2 w-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-1 px-2 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 backdrop-blur-sm`}
                >
                  {availableIntervals.map((interval) => (
                    <TabsTrigger
                      key={interval}
                      value={interval}
                      className={`
                        relative px-4 py-1 rounded-lg text-sm font-semibold transition-all duration-300 min-w-[80px]
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-primary-600 
                        data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary-300/50 
                        data-[state=active]:dark:shadow-primary-800/50 data-[state=active]:scale-105
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-400 
                        data-[state=inactive]:hover:text-primary-600 data-[state=inactive]:dark:hover:text-primary-400
                        data-[state=inactive]:hover:bg-primary-100 data-[state=inactive]:dark:hover:bg-primary-950/30
                        data-[state=inactive]:hover:scale-102
                      `}
                    >
                      <span className="z-10 relative flex justify-center items-center capitalize">
                        {t(interval.toLowerCase())}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}

            {availableIntervals.map((interval) => (
              <TabsContent key={interval} value={interval}>
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-4">
                  {plansToDisplay.map((plan) => (
                    <PricingPlanCard key={plan.id} plan={plan} selectedInterval={interval} />
                  ))}
                </div>
              </TabsContent>
            ))}

            {availableIntervals.length === 0 && (
              <div className="py-16 text-center">
                <div className="max-w-md">
                  <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground text-lg">{t("no plans available")}</h3>
                  <p className="text-muted-foreground">{t("check back later for more options")}</p>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

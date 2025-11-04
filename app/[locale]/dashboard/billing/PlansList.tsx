"use client";

import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Plan } from "@/types";
import PlanCard from "./PlanCard";

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

async function userFetcher() {
  const response = await axios.get("/api/users/current");

  return response.data;
}

export default function PlansList() {
  const t = useTranslations("pricing");
  const { data, error, isLoading } = useSWR<PlansResponse>(
    ["plans", "active"],
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  );
  const { data: user } = useSWR("current-user", userFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const intervals = ["DAY", "WEEK", "MONTH", "YEAR"];
  const [activeInterval, setActiveInterval] = useState("MONTH");

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {t("subscription plans")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex justify-center mb-12">
              <div className="grid grid-cols-4 p-2 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
                {intervals.map((interval) => (
                  <Skeleton
                    key={interval}
                    className="w-20 h-12 mx-1 rounded-xl"
                  />
                ))}
              </div>
            </div>
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full h-[520px] rounded-3xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {t("subscription plans")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-muted-foreground text-center">
            {t("failed to load plans")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const plans = data.data || [];

  // Get all available intervals from all plans that have prices with values
  const availableIntervals = intervals.filter((interval) => {
    return plans.some((plan) =>
      plan.prices?.some(
        (price) => price.interval === interval && price.price != null
      )
    );
  });

  // Set default active interval to first available, or fallback to "MONTH"
  const defaultInterval =
    availableIntervals.length > 0 ? availableIntervals[0] : "MONTH";

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          {t("subscription plans")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-7xl mx-auto">
          <Tabs
            value={
              availableIntervals.includes(activeInterval as any)
                ? activeInterval
                : defaultInterval
            }
            onValueChange={setActiveInterval}
            className="w-full"
          >
            {availableIntervals.length > 1 && (
              <div className="flex justify-center mb-6">
                <TabsList
                  className={`h-auto grid gap-2 w-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-1 px-2 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 backdrop-blur-sm`}
                  style={{
                    gridTemplateColumns: `repeat(${availableIntervals.length}, minmax(0, 1fr))`,
                  }}
                >
                  {availableIntervals.map((interval, index) => (
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
                <div className="justify-center gap-x-2 gap-y-4 grid sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                  {plans
                    .filter((plan) =>
                      plan.prices?.some(
                        (price) =>
                          price.interval === interval && price.price != null
                      )
                    )
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        user={user}
                        selectedInterval={interval}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}

            {availableIntervals.length === 0 && (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground text-lg">
                    {t("no plans available")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("check back later for more options")}
                  </p>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

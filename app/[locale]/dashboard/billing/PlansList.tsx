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

export default function PlansList() {
  const t = useTranslations("pricing");
  const { data, error, isLoading } = useSWR<PlansResponse>(
    ["plans", "active"],
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  );

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
              <div className="grid grid-cols-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-xl">
                {intervals.map((interval) => (
                  <Skeleton
                    key={interval}
                    className="h-12 w-20 rounded-xl mx-1"
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[520px] w-full rounded-3xl" />
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
          <div className="text-center py-8 text-muted-foreground">
            {t("failed to load plans")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const plans = data.data || [];

  const grouped = intervals.reduce((acc, interval) => {
    acc[interval] = plans.filter((p) => p.interval === interval);
    return acc;
  }, {} as Record<string, Plan[]>);

  // Filter intervals to only show those with plans
  const availableIntervals = intervals.filter(
    (interval) => grouped[interval]?.length > 0
  );

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
            defaultValue={defaultInterval}
            onValueChange={setActiveInterval}
            className="w-full"
          >
            {availableIntervals.length > 1 && (
              <div className="flex justify-center mb-6">
                <TabsList
                  className={`h-auto grid w-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-1 px-2 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 backdrop-blur-sm`}
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
                    data-[state=inactive]:hover:bg-primary-50 data-[state=inactive]:dark:hover:bg-primary-950/30
                    data-[state=inactive]:hover:scale-102
                  `}
                    >
                      <span className="relative z-10 flex items-center justify-center capitalize">
                        {t(interval.toLowerCase())}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}

            {availableIntervals.map((interval) => (
              <TabsContent key={interval} value={interval}>
                <div className="grid sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-center gap-x-2 gap-y-4">
                  {grouped[interval].map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </TabsContent>
            ))}

            {availableIntervals.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
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

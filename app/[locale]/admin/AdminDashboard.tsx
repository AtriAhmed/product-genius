"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import OverviewCards from "@/app/[locale]/admin/OverviewCards";
import GrowthCharts from "@/app/[locale]/admin/GrowthCharts";
import DistributionCharts from "@/app/[locale]/admin/DistributionCharts";
import TopPerformers from "@/app/[locale]/admin/TopPerformers";
import ConversionFunnel from "@/app/[locale]/admin/ConversionFunnel";
import RecentActivity from "@/app/[locale]/admin/RecentActivity";
import axios from "axios";

type Period = "1d" | "7d" | "30d" | "90d" | "1y" | "all";

async function fetcher(url: string) {
  const response = await axios.get(url);
  return response.data;
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("30d");

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(`/api/stats/admin?period=${period}`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  if (error) {
    return (
      <div className="container">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">Failed to load admin statistics. Please try again later.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !stats?.data) {
    return (
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-3xl">Admin Dashboard</h1>
          <Skeleton className="w-32 h-10" />
        </div>
        <div className="gap-6 grid">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="w-20 h-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-16 h-8 mb-2" />
                  <Skeleton className="w-24 h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="font-bold text-3xl">Admin Dashboard</h1>
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-32 ms-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {/* Overview Cards */}
        <OverviewCards data={stats.data.overview} />

        {/* Recent Activity Section */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Recent Activity</h2>
            <p className="text-muted-foreground">Latest users and orders</p>
          </div>
          <RecentActivity data={stats.data.recent} />
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Analytics</h2>
            <p className="text-muted-foreground">Growth trends and conversion metrics</p>
          </div>
          <GrowthCharts data={stats.data.growth} />
          <ConversionFunnel data={stats.data.funnel} />
        </div>

        {/* Distributions Section */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Distributions</h2>
            <p className="text-muted-foreground">Status and category breakdowns</p>
          </div>
          <DistributionCharts data={stats.data.distributions} />
        </div>

        {/* Performance Section */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Top Performers</h2>
            <p className="text-muted-foreground">Best categories and products</p>
          </div>
          <TopPerformers categories={stats.data.topCategories} products={stats.data.topProducts} />
        </div>
      </div>
    </div>
  );
}

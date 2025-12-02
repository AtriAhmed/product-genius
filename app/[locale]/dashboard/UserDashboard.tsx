"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

import UserOverviewCards from "@/app/[locale]/dashboard/UserOverviewCards";
import UserGrowthCharts from "@/app/[locale]/dashboard/UserGrowthCharts";
import UserDistributionCharts from "@/app/[locale]/dashboard/UserDistributionCharts";
import UserTopProducts from "@/app/[locale]/dashboard/UserTopProducts";
import UserRecentActivity from "@/app/[locale]/dashboard/UserRecentActivity";
import UserSubscriptionCard from "@/app/[locale]/dashboard/UserSubscriptionCard";

type Period = "7d" | "30d" | "90d" | "1y" | "all";

async function fetcher(url: string) {
  const response = await axios.get(url);
  return response.data;
}

export default function UserDashboard() {
  const [period, setPeriod] = useState<Period>("30d");

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(`/api/stats/dashboard?period=${period}`, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  if (error) {
    return (
      <div className="container">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">Failed to load your dashboard. Please try again later.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !stats?.data) {
    return (
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-3xl">Dashboard</h1>
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
        <div>
          <h1 className="font-bold text-3xl">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your orders, spending, and activity</p>
        </div>
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-32 ms-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
        <UserOverviewCards data={stats.data.overview} />

        {/* Subscription Card (if user has subscription) */}
        {stats.data.subscription && <UserSubscriptionCard data={stats.data.subscription} />}

        {/* Analytics Section */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Your Activity</h2>
            <p className="text-muted-foreground">Orders and spending trends over time</p>
          </div>
          <UserGrowthCharts data={stats.data.growth} />
        </div>

        {/* Order Status Distribution */}
        {stats.data.distributions.orderStatus.length > 0 && (
          <div className="space-y-6">
            <div className="pb-2 border-b">
              <h2 className="font-semibold text-2xl">Order Status</h2>
              <p className="text-muted-foreground">Breakdown of your order statuses</p>
            </div>
            <UserDistributionCharts data={stats.data.distributions} />
          </div>
        )}

        {/* Top Products */}
        {stats.data.topProducts.length > 0 && (
          <div className="space-y-6">
            <div className="pb-2 border-b">
              <h2 className="font-semibold text-2xl">Your Favorite Products</h2>
              <p className="text-muted-foreground">Products you order most frequently</p>
            </div>
            <UserTopProducts data={stats.data.topProducts} />
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="pb-2 border-b">
            <h2 className="font-semibold text-2xl">Recent Orders</h2>
            <p className="text-muted-foreground">Your latest purchase activity</p>
          </div>
          <UserRecentActivity data={stats.data.recent} />
        </div>
      </div>
    </div>
  );
}

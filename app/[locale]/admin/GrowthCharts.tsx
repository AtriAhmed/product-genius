"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type GrowthData = {
  users: Record<string, number>;
  revenue: Record<string, number>;
};

type GrowthChartsProps = {
  data: GrowthData;
};

export default function GrowthCharts({ data }: GrowthChartsProps) {
  // Process user growth data for chart
  const userGrowthData = Object.entries(data.users).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    users: count,
  }));

  // Process revenue growth data for chart
  const revenueGrowthData = Object.entries(data.revenue).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString(),
    revenue: amount,
  }));

  // Calculate cumulative data
  let cumulativeUsers = 0;
  const cumulativeUserData = userGrowthData.map((item) => {
    cumulativeUsers += item.users;
    return {
      ...item,
      cumulative: cumulativeUsers,
    };
  });

  let cumulativeRevenue = 0;
  const cumulativeRevenueData = revenueGrowthData.map((item) => {
    cumulativeRevenue += item.revenue;
    return {
      ...item,
      cumulative: cumulativeRevenue,
    };
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            User Growth
            <span className="font-normal text-muted-foreground text-sm">New registrations over time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeUserData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value: number, name: string) => [
                    name === "users" ? `${value} new` : `${value} total`,
                    name === "users" ? "New Users" : "Total Users",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue Growth
            <span className="font-normal text-muted-foreground text-sm">Revenue generated over time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "revenue" ? "Daily Revenue" : "Total Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

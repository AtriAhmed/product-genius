"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type GrowthData = {
  orders: Record<string, number>;
  spending: Record<string, number>;
};

type UserGrowthChartsProps = {
  data: GrowthData;
};

export default function UserGrowthCharts({ data }: UserGrowthChartsProps) {
  // Process order growth data for chart
  const orderGrowthData = Object.entries(data.orders).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    orders: count,
  }));

  // Process spending growth data for chart
  const spendingGrowthData = Object.entries(data.spending).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString(),
    spending: amount,
  }));

  // Calculate cumulative data
  let cumulativeOrders = 0;
  const cumulativeOrderData = orderGrowthData.map((item) => {
    cumulativeOrders += item.orders;
    return {
      ...item,
      cumulative: cumulativeOrders,
    };
  });

  let cumulativeSpending = 0;
  const cumulativeSpendingData = spendingGrowthData.map((item) => {
    cumulativeSpending += item.spending;
    return {
      ...item,
      cumulative: cumulativeSpending,
    };
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  // If no data, show empty state
  if (orderGrowthData.length === 0 && spendingGrowthData.length === 0) {
    return (
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-80 text-muted-foreground">
              No order activity in this period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spending Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-80 text-muted-foreground">
              No spending activity in this period
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
      {/* Order Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Activity
            <span className="font-normal text-muted-foreground text-sm">Your orders over time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {orderGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeOrderData}>
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
                      name === "orders" ? `${value} new` : `${value} total`,
                      name === "orders" ? "New Orders" : "Total Orders",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
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
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No order data for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spending Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Spending Activity
            <span className="font-normal text-muted-foreground text-sm">Your spending over time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {spendingGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeSpendingData}>
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
                      name === "spending" ? "Daily Spending" : "Total Spending",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
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
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No spending data for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

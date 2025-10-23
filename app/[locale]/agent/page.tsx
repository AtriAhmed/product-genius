import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function AgentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your business.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">$45,231.89</div>
            <p className="text-muted-foreground text-xs">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">+2,350</div>
            <p className="text-muted-foreground text-xs">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">+12,234</div>
            <p className="text-muted-foreground text-xs">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Active Products
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">573</div>
            <p className="text-muted-foreground text-xs">+5 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Order #1234</span>
                <span className="text-muted-foreground text-sm">$89.99</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Order #1235</span>
                <span className="text-muted-foreground text-sm">$129.99</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Order #1236</span>
                <span className="text-muted-foreground text-sm">$45.50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Wireless Headphones</span>
                <span className="text-muted-foreground text-sm">234 sold</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Smart Watch</span>
                <span className="text-muted-foreground text-sm">189 sold</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Phone Case</span>
                <span className="text-muted-foreground text-sm">156 sold</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <span className="text-green-600 text-sm">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API</span>
                <span className="text-green-600 text-sm">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payments</span>
                <span className="text-green-600 text-sm">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

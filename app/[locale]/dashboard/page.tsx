import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your account activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">
              +$180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wishlist Items
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 items this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">5 pending reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Wireless Headphones</span>
                <span className="text-sm text-muted-foreground">$89.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Watch</span>
                <span className="text-sm text-muted-foreground">$129.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Phone Case</span>
                <span className="text-sm text-muted-foreground">$15.50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Track your current orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Order #1237</span>
                <span className="text-sm text-blue-600">Shipped</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Order #1238</span>
                <span className="text-sm text-yellow-600">Processing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Order #1239</span>
                <span className="text-sm text-green-600">Delivered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Products you might like</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bluetooth Speaker</span>
                <span className="text-sm text-muted-foreground">$59.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Laptop Stand</span>
                <span className="text-sm text-muted-foreground">$34.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">USB-C Cable</span>
                <span className="text-sm text-muted-foreground">$12.99</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

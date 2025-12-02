import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Package } from "lucide-react";

type OrderItem = {
  id: number;
  title: string;
  quantity: number;
  unitPriceCents: number;
};

type Order = {
  id: number;
  orderNumber: string;
  totalCents: number;
  currency: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type RecentData = {
  orders: Order[];
};

type UserRecentActivityProps = {
  data: RecentData;
};

const getStatusColor = (status: string) => {
  const statusColors = {
    PAID: "default",
    COMPLETED: "default",
    PROCESSING: "secondary",
    UNPAID: "destructive",
    CANCELED: "destructive",
    REFUNDED: "outline",
    DRAFT: "outline",
    INVALID: "destructive",
  } as const;
  return statusColors[status as keyof typeof statusColors] || "secondary";
};

const getStatusLabel = (status: string) => {
  const labels = {
    PAID: "Paid",
    COMPLETED: "Completed",
    PROCESSING: "Processing",
    UNPAID: "Unpaid",
    CANCELED: "Canceled",
    REFUNDED: "Refunded",
    DRAFT: "Draft",
    INVALID: "Invalid",
  };
  return labels[status as keyof typeof labels] || status;
};

export default function UserRecentActivity({ data }: UserRecentActivityProps) {
  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (data.orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-muted-foreground text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2 font-medium text-lg">No orders yet</p>
            <p className="text-sm">Your order history will appear here once you make your first purchase.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Recent Orders
          <span className="font-normal text-muted-foreground text-sm">Your latest purchases</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.orders.map((order) => (
            <div key={order.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              {/* Order Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">#{order.orderNumber}</h3>
                  <Badge variant={getStatusColor(order.status)} className="text-xs">
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(order.totalCents, order.currency)}</div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-1 mb-2 font-medium text-muted-foreground text-xs">
                    <Package className="w-3 h-3" />
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </div>

                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="text-muted-foreground">{item.quantity}x</span> {item.title}
                      </div>
                      <div className="text-muted-foreground">
                        {formatCurrency(item.unitPriceCents / 100, order.currency)}
                      </div>
                    </div>
                  ))}

                  {order.items.length > 3 && (
                    <div className="text-muted-foreground text-xs">
                      +{order.items.length - 3} more {order.items.length - 3 === 1 ? "item" : "items"}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {data.orders.length >= 5 && (
          <div className="mt-4 pt-4 border-t text-muted-foreground text-xs text-center">
            Showing 5 most recent orders
          </div>
        )}
      </CardContent>
    </Card>
  );
}

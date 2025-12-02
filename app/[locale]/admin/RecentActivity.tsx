import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, ShoppingCart, Clock } from "lucide-react";

type User = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

type Order = {
  id: number;
  orderNumber: string;
  totalCents: number;
  currency: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type RecentData = {
  users: User[];
  orders: Order[];
};

type RecentActivityProps = {
  data: RecentData;
};

const getStatusColor = (status: string) => {
  const statusColors = {
    PAID: "bg-green-500",
    COMPLETED: "bg-green-600",
    PROCESSING: "bg-blue-500",
    UNPAID: "bg-yellow-500",
    CANCELED: "bg-red-500",
    REFUNDED: "bg-gray-500",
    DRAFT: "bg-gray-400",
    INVALID: "bg-red-600",
  };
  return statusColors[status as keyof typeof statusColors] || "bg-gray-500";
};

function getRoleColor(role: string) {
  const roleColors = {
    OWNER: "destructive",
    ADMIN: "destructive",
    EDITOR: "secondary",
    AGENT: "outline",
    USER: "secondary",
  } as const;
  return roleColors[role as keyof typeof roleColors] || "secondary";
}

export default function RecentActivity({ data }: RecentActivityProps) {
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

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Users
            <span className="font-normal text-muted-foreground text-sm">Latest registrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.users.length === 0 ? (
              <div className="py-8 text-muted-foreground text-center">No recent users found</div>
            ) : (
              data.users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs">{getInitials(user.name, user.email)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{user.name || "Anonymous User"}</p>
                      <Badge variant={getRoleColor(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
            <span className="font-normal text-muted-foreground text-sm">Latest transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.orders.length === 0 ? (
              <div className="py-8 text-muted-foreground text-center">No recent orders found</div>
            ) : (
              data.orders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {order.user.name || "Anonymous"} ({order.user.email})
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(order.totalCents, order.currency)}</div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

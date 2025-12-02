import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Package, Bell, Store, MapPin, TrendingUp, Activity } from "lucide-react";

type OverviewData = {
  totalOrders: number;
  totalSpent: number;
  totalProducts: number;
  productMappings: number;
  variantMappings: number;
  shopifyStores: number;
  unreadNotifications: number;
  avgOrderValue: number;
  subscriptionValue: number;
  subscriptionStatus: string | null;
  planName: string | null;
};

type UserOverviewCardsProps = {
  data: OverviewData;
};

export default function UserOverviewCards({ data }: UserOverviewCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const getSubscriptionBadgeVariant = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "TRIALING":
        return "secondary";
      case "PAST_DUE":
        return "destructive";
      case "CANCELED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const cards = [
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      subtitle: data.totalOrders === 1 ? "order placed" : "orders placed",
      icon: ShoppingCart,
      trend: `AOV: ${formatCurrency(data.avgOrderValue)}`,
      color: "blue",
    },
    {
      title: "Total Spent",
      value: formatCurrency(data.totalSpent),
      subtitle: "lifetime spending",
      icon: DollarSign,
      trend: data.totalOrders > 0 ? `${formatCurrency(data.avgOrderValue)} per order` : "No orders yet",
      color: "green",
    },
    {
      title: "Products",
      value: data.totalProducts.toLocaleString(),
      subtitle: data.totalProducts === 1 ? "product managed" : "products managed",
      icon: Package,
      trend: `${data.productMappings} mappings`,
      color: "purple",
    },
    {
      title: "Notifications",
      value: data.unreadNotifications.toLocaleString(),
      subtitle: data.unreadNotifications === 1 ? "unread notification" : "unread notifications",
      icon: Bell,
      trend: data.unreadNotifications > 0 ? "Check your inbox" : "All caught up!",
      color: data.unreadNotifications > 0 ? "orange" : "teal",
    },
    {
      title: "Shopify Stores",
      value: data.shopifyStores.toLocaleString(),
      subtitle: data.shopifyStores === 1 ? "connected store" : "connected stores",
      icon: Store,
      trend: "Integrations",
      color: "indigo",
    },
    {
      title: "Variant Mappings",
      value: data.variantMappings.toLocaleString(),
      subtitle: data.variantMappings === 1 ? "variant mapped" : "variants mapped",
      icon: MapPin,
      trend: "Product variations",
      color: "pink",
    },
  ];

  // Add subscription card if user has a subscription
  if (data.subscriptionStatus && data.planName) {
    cards.push({
      title: "Subscription",
      value: data.planName,
      subtitle: formatCurrency(data.subscriptionValue),
      icon: TrendingUp,
      trend: data.subscriptionStatus,
      color: "emerald",
    });
  }

  // If we have less than 8 cards and there's meaningful activity, add an activity summary
  if (cards.length < 8 && data.totalOrders > 0) {
    cards.push({
      title: "Account Activity",
      value: "Active",
      subtitle: `${data.totalOrders} orders, ${data.totalProducts} products`,
      icon: Activity,
      trend: "Your account summary",
      color: "slate",
    });
  }

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">{card.title}</CardTitle>
              <IconComponent className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-1 font-bold text-2xl">{card.value}</div>
              <div className="mb-2 text-muted-foreground text-sm">{card.subtitle}</div>
              {card.title === "Subscription" && data.subscriptionStatus ? (
                <Badge variant={getSubscriptionBadgeVariant(data.subscriptionStatus)} className="text-xs">
                  {data.subscriptionStatus}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {card.trend}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

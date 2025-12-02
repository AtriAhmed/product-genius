import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Package, DollarSign, TrendingUp, CreditCard, Store, FileText } from "lucide-react";

type OverviewData = {
  totalUsers: number;
  totalActiveUsers: number;
  totalProducts: number;
  totalActiveProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  totalPaidInvoices: number;
  totalSubscriptions: number;
  totalShopifyStores: number;
  mrr: number;
  avgOrderValue: number;
};

type OverviewCardsProps = {
  data: OverviewData;
};

export default function OverviewCards({ data }: OverviewCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      subtitle: `${data.totalActiveUsers} active users`,
      icon: Users,
      trend:
        data.totalActiveUsers > 0
          ? `${Math.round((data.totalActiveUsers / data.totalUsers) * 100)}% active`
          : "0% active",
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      subtitle: `MRR: ${formatCurrency(data.mrr)}`,
      icon: DollarSign,
      trend: `${data.totalPaidInvoices} paid invoices`,
      color: "green",
    },
    {
      title: "Products",
      value: data.totalProducts.toLocaleString(),
      subtitle: `${data.totalActiveProducts} active`,
      icon: Package,
      trend:
        data.totalProducts > 0
          ? `${Math.round((data.totalActiveProducts / data.totalProducts) * 100)}% active`
          : "0% active",
      color: "purple",
    },
    {
      title: "Orders",
      value: data.totalOrders.toLocaleString(),
      subtitle: `AOV: ${formatCurrency(data.avgOrderValue)}`,
      icon: ShoppingCart,
      trend: "All time",
      color: "orange",
    },
    {
      title: "Subscriptions",
      value: data.totalSubscriptions.toLocaleString(),
      subtitle: "Total subscriptions",
      icon: CreditCard,
      trend: `MRR: ${formatCurrency(data.mrr)}`,
      color: "indigo",
    },
    {
      title: "Categories",
      value: data.totalCategories.toLocaleString(),
      subtitle: "Product categories",
      icon: FileText,
      trend: "Organized inventory",
      color: "teal",
    },
    {
      title: "Shopify Stores",
      value: data.totalShopifyStores.toLocaleString(),
      subtitle: "Connected stores",
      icon: Store,
      trend: "Integrations",
      color: "pink",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data.mrr),
      subtitle: "Recurring revenue",
      icon: TrendingUp,
      trend: "Per month",
      color: "emerald",
    },
  ];

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
              <Badge variant="secondary" className="text-xs">
                {card.trend}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

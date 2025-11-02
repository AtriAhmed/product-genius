import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, OrderStatus } from "@/types";
import { Eye, Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrdersDataTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  isLoading: boolean;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "DRAFT":
      return "!bg-gray-300 text-gray-900";
    case "PENDING": // unpaid, waiting for payment so a red color
      return "!bg-red-500 text-white";
    case "PAID":
      return "!bg-green-300 text-green-900";
    case "PROCESSING":
      return "!bg-blue-300 text-blue-900";
    case "COMPLETED":
      return "!bg-purple-300 text-purple-900";
    case "CANCELED":
      return "!bg-red-300 text-red-900";
    case "REFUNDED":
      return "!bg-orange-300 text-orange-900";
    default:
      return "!bg-gray-100 text-gray-800";
  }
};

const formatCurrency = (cents: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default function OrdersDataTable({
  orders,
  onView,
  isLoading,
}: OrdersDataTableProps) {
  const t = useTranslations("orders");

  if (isLoading) {
    return (
      <div className="w-0 min-w-full border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("order number")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("shipment status")}</TableHead>
              <TableHead>{t("order total")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="w-24 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-32 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-16 h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-20 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-28 h-4" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="w-16 h-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="w-0 min-w-full border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("order number")}</TableHead>
            <TableHead>{t("customer")}</TableHead>
            <TableHead>{t("shipment status")}</TableHead>
            <TableHead>{t("order total")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="max-w-[120px] truncate">
                    {order.orderNumber}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.user?.name || "N/A"}</div>
                  <div className="text-muted-foreground text-sm">
                    {order.user?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status!)}>
                  {t(order.status?.toLowerCase() || "unavailable")}
                </Badge>
              </TableCell>
              <TableCell>
                {formatCurrency(order.totalCents || 0, order.currency)}
              </TableCell>
              <TableCell>
                {order.createdAt ? formatDate(order.createdAt) : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(order)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

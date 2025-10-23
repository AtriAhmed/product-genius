import { useTranslations } from "next-intl";
import { Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, ShipmentStatus } from "@/types";

interface OrdersDataTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  isLoading: boolean;
}

const getShipmentStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "PICKED":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "DELIVERED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "RETURNED":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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
      <div className="border rounded-lg bg-card">
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
    <div className="border rounded-lg bg-card">
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
                <Badge
                  className={getShipmentStatusColor(order.shipmentStatus!)}
                >
                  {t(order.shipmentStatus?.toLowerCase() || "pending")}
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

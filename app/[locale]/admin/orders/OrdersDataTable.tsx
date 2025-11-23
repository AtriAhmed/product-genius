import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useRouter } from "@/i18n/navigation";
import { formatCurrencyCents, stopPropagation } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { Edit, ExternalLink, NotepadText, Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrdersDataTableProps {
  orders: Order[];
  onEditTracking: (order: Order) => void;
  isLoading: boolean;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "DRAFT":
      return "!bg-gray-300 !text-gray-900";
    case "UNPAID": // unpaid, waiting for payment so a red color
      return "!bg-red-500 !text-white";
    case "PAID":
      return "!bg-green-300 !text-green-900";
    case "PROCESSING":
      return "!bg-blue-300 !text-blue-900";
    case "COMPLETED":
      return "!bg-purple-300 !text-purple-900";
    case "CANCELED":
      return "!bg-red-300 !text-red-900";
    case "REFUNDED":
      return "!bg-orange-300 !text-orange-900";
    default:
      return "!bg-gray-100 !text-gray-800";
  }
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

export default function OrdersDataTable({ orders, onEditTracking, isLoading }: OrdersDataTableProps) {
  const t = useTranslations("orders");
  const router = useRouter();

  const skeletonRows = Array.from({ length: 5 }).map((_, idx) => (
    <TableRow key={`skeleton-${idx}`} className="border-border transition-colors">
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
        <Skeleton className="w-20 h-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-28 h-4" />
      </TableCell>
      <TableCell className="py-1 text-right">
        <div className="flex justify-end items-center gap-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
      </TableCell>
    </TableRow>
  ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={7}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
            <NotepadText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no orders found")}</h3>
          <p className="mb-4 text-muted-foreground text-sm">{t("try adjusting your search or filters")}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  function handleView(event: React.MouseEvent, order: Order) {
    if (event.ctrlKey) {
      window.open(`/admin/orders/${order.id}`, "_blank");
    } else {
      router.push(`/admin/orders/${order.id}`);
    }
  }

  return (
    <div className="w-0 min-w-full border rounded-md bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="font-medium">{t("order number")}</TableHead>
            <TableHead className="font-medium">{t("customer")}</TableHead>
            <TableHead className="font-medium">{t("status")}</TableHead>
            <TableHead className="font-medium">{t("tracking")}</TableHead>
            <TableHead className="font-medium">{t("order total")}</TableHead>
            <TableHead className="font-medium">{t("date")}</TableHead>
            <TableHead className="font-medium text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : orders.length > 0
            ? orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    handleView(e, order);
                  }}
                >
                  <TableCell className="py-1 font-medium">
                    <Link
                      className="flex items-center gap-2 hover:underline"
                      href={`/admin/orders/${order.id}`}
                      onClick={stopPropagation}
                    >
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="max-w-[120px] truncate">{order.orderNumber}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[150px] py-1">
                    <div>
                      <div className="font-medium">{order.user?.name || "N/A"}</div>
                      <div className="text-muted-foreground text-sm truncate">{order.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge className={getStatusColor(order.status!)}>
                      {t(order.status?.toLowerCase() || "pending")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[100px] truncate">{order.trackingNumber || t("n/a")}</span>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1">{formatCurrencyCents(order.totalCents || 0, order.currency)}</TableCell>
                  <TableCell className="py-1">{order.createdAt ? formatDate(order.createdAt) : "N/A"}</TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTracking(order);
                        }}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

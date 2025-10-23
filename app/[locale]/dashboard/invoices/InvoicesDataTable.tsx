import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Invoice } from "@/types";

type InvoicesDataTableProps = {
  invoices: Invoice[];
  onDownload: (invoice: Invoice) => void;
  onViewHosted: (invoice: Invoice) => void;
  isLoading: boolean;
};

export default function InvoicesDataTable({
  invoices,
  onDownload,
  onViewHosted,
  isLoading,
}: InvoicesDataTableProps) {
  const t = useTranslations("invoices");

  const formatCurrency = (amountCents?: number, currency = "USD") => {
    if (!amountCents) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "void":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "uncollectible":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "PLAN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "ORDER":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoice id")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("total")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="w-16 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-12 h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-12 h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-32 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-16 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-24 h-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-8 border rounded-lg bg-card shadow-sm text-center">
        <h3 className="font-semibold text-foreground text-lg">
          {t("no invoices")}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {t("no invoices description")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border rounded-lg bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("invoice id")}</TableHead>
            <TableHead>{t("type")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("total")}</TableHead>
            <TableHead className="text-end">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">#{invoice.id}</TableCell>
              <TableCell>
                {invoice.type && (
                  <Badge className={getTypeColor(invoice.type)}>
                    {t(invoice.type.toLowerCase())}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {invoice.status && (
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(invoice.amountCents, invoice.currency)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(invoice)}
                    disabled={!invoice.pdfUrl}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewHosted(invoice)}
                    disabled={!invoice.hostedUrl}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

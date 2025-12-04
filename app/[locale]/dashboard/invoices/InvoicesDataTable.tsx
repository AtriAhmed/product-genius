import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import { CreditCard, Download, Eye, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

type InvoicesDataTableProps = {
  invoices: Invoice[];
  onDownload: (invoice: Invoice) => void;
  onViewHosted: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  isLoading: boolean;
};

export default function InvoicesDataTable({
  invoices,
  onDownload,
  onViewHosted,
  onPay,
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
    return new Intl.DateTimeFormat("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "!bg-green-600 text-white !dark:bg-green-900 dark:text-green-300";
      case "open":
        return "!bg-red-500 text-white !dark:bg-red-900 dark:text-red-300";
      default:
        return "!bg-gray-100 text-gray-800 !dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "paid":
        return t("paid");
      case "open":
        return t("unpaid");
      default:
        return t("unavailable");
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "PLAN":
        return "!bg-purple-100 text-purple-800 !dark:bg-purple-900 dark:text-purple-300";
      case "ORDER":
        return "!bg-emerald-100 text-emerald-800 !dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "!bg-gray-100 text-gray-800 !dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell className="py-1">
        <div className="w-16 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="py-1">
        <div className="w-12 h-6 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="py-1">
        <div className="w-12 h-6 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="py-1">
        <div className="w-32 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="py-1">
        <div className="w-20 h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="w-24 h-8 ml-auto rounded bg-muted animate-pulse" />
      </TableCell>
    </TableRow>
  ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no invoices")}</h3>
          <p className="text-muted-foreground text-sm">{t("no invoices description")}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-nowrap">{t("invoice id")}</TableHead>
            <TableHead className="text-nowrap">{t("type")}</TableHead>
            <TableHead className="text-nowrap">{t("status")}</TableHead>
            <TableHead className="text-nowrap">{t("total")}</TableHead>
            <TableHead className="text-nowrap">{t("created at")}</TableHead>
            <TableHead className="text-right text-nowrap">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : invoices.length > 0
            ? invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="py-1 font-medium">#{invoice.id?.toString()?.padStart(6, "0")}</TableCell>
                  <TableCell className="py-1">
                    {invoice.type && (
                      <Badge className={getTypeColor(invoice.type)}>{t(invoice.type.toLowerCase())}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-1">
                    {invoice.status && (
                      <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-1 font-medium text-nowrap">
                    {formatCurrency(invoice.amountCents, invoice.currency)}
                  </TableCell>
                  <TableCell className="py-1 text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell className="py-1 text-right">
                    {invoice?.status === "paid" ? (
                      <div className="flex justify-end gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(invoice)}
                          disabled={!invoice.pdfUrl}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                        </Button> */}
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
                    ) : invoice?.status === "open" ? (
                      // paid invoice button
                      <Button
                        size="sm"
                        onClick={() => onPay(invoice)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4" />
                        {t("pay")}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}

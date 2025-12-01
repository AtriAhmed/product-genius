import { useTranslations } from "next-intl";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, CreditCard, Sparkles, Calendar, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  onNext: () => void;
};

export default function InvoiceReviewStep({ invoice, onNext }: Props) {
  const t = useTranslations("invoices");

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
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

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Invoice Card */}
      <Card className="group flex flex-col grow h-0 overflow-y-auto border-2 border-primary-300 dark:border-primary-600 bg-gradient-to-br from-white dark:from-neutral-800 via-primary-50 dark:via-primary-900/30 to-primary-100 dark:to-primary-900/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="top-0 right-0 absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
        <CardContent className="relative space-y-3 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-bold text-primary-900 dark:text-primary-100 text-lg">
                Invoice #{invoice.id}
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(invoice.type)}`}>
                  {t(invoice.type?.toLowerCase() || "")}
                </div>
              </h3>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs">
                Created on {formatDate(invoice.createdAt)}
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-700 dark:to-primary-600 shadow-lg text-white text-right">
              <div className="font-black text-xl">{formatCurrency((invoice.amountCents || 0) / 100)}</div>
              <div className="opacity-90 font-semibold text-xs">{invoice.currency?.toUpperCase() || "USD"}</div>
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent" />

          {/* Invoice Details */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-bold text-primary-900 dark:text-primary-100 text-sm">
              <Receipt className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Invoice Details
            </h4>
            <div className="space-y-1.5">
              {invoice.periodStart && invoice.periodEnd && (
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 hover:bg-white dark:bg-neutral-800/50 dark:hover:bg-neutral-800 text-xs transition-colors">
                  <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-md">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Billing Period: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 hover:bg-white dark:bg-neutral-800/50 dark:hover:bg-neutral-800 text-xs transition-colors">
                <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-md">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <span className="text-neutral-700 dark:text-neutral-300">
                  Status: {invoice.status === "open" ? t("unpaid") : t("paid")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card className="border-2 border-primary-200 dark:border-primary-700 bg-gradient-to-br from-white dark:from-neutral-800 to-primary-50 dark:to-primary-950/30 shadow-lg">
        <CardContent className="space-y-2 p-3">
          <h4 className="flex items-center gap-2 font-bold text-primary-900 dark:text-primary-100 text-sm">
            <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            Payment Summary
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
              <span>Subtotal:</span>
              <span>{formatCurrency(((invoice.amountCents || 0) - (invoice.taxCents || 0)) / 100)}</span>
            </div>
            {/* {invoice.taxCents && invoice.taxCents > 0 && (
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>Tax:</span>
                <span>{formatCurrency((invoice.taxCents || 0) / 100)}</span>
              </div>
            )} */}
            <Separator className="bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent" />
            <div className="flex justify-between bg-clip-text bg-gradient-to-r from-primary-600 dark:from-primary-400 to-primary-700 dark:to-primary-500 font-bold text-transparent text-sm">
              <span>Total Due</span>
              <span className="text-base">{formatCurrency((invoice.amountCents || 0) / 100)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onNext}
        className="w-full py-5 rounded-xl bg-gradient-to-r from-primary-600 hover:from-primary-700 via-primary-600 hover:via-primary-700 to-primary-700 hover:to-primary-800 shadow-xl hover:shadow-2xl font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Continue to Payment
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

type InvoicesFiltersProps = {
  type: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
};

export default function InvoicesFilters({
  type,
  status,
  sortBy,
  sortOrder,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
}: InvoicesFiltersProps) {
  const t = useTranslations("invoices");

  const handleSortByChange = (newSortBy: string) => {
    onSortChange(newSortBy, sortOrder);
  };

  const handleSortOrderChange = (newSortOrder: string) => {
    onSortChange(sortBy, newSortOrder);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-2">
      {/* Type Filter */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm">{t("type")}</label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all types")}</SelectItem>
            <SelectItem value="PLAN">{t("plan")}</SelectItem>
            <SelectItem value="ORDER">{t("order")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm">{t("status")}</label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all statuses")}</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="void">Void</SelectItem>
            <SelectItem value="uncollectible">Uncollectible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm">{t("sort by")}</label>
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">{t("created at")}</SelectItem>
            <SelectItem value="amountCents">{t("amount")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm">Order</label>
        <Select value={sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t("newest first")}</SelectItem>
            <SelectItem value="asc">{t("oldest first")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      <div className="flex flex-col gap-2">
        <div className="text-sm">&nbsp;</div>
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <Filter className="w-4 h-4" />
          {t("clear filters")}
        </Button>
      </div>
    </div>
  );
}

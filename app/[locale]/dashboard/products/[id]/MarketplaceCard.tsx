import { Building2, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Supplier } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SupplierCardProps {
  supplier: Supplier;
  compact?: boolean;
}

export default function MarketplaceCard({
  supplier,
  compact = true,
}: SupplierCardProps) {
  const domain = supplier.url?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Card className="flex flex-col overflow-hidden !p-2 border shadow-sm">
      <CardContent className="flex flex-col space-y-2.5 h-full !p-2">
        {/* Header: Marketplace + Star */}
        <div className="flex items-center gap-2.5">
          <div className="flex justify-center items-center w-8 h-8 border border-primary/20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <Building2 className="w-3.5 h-3.5 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-foreground text-sm truncate">
                {supplier.marketplace}
              </h4>
              <Star className="flex-shrink-0 w-3.5 h-3.5 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="min-w-0 font-semibold text-muted-foreground text-xs truncate">
          {supplier?.notes}
        </div>

        {/* Price & Domain Row */}
        <div className="flex justify-between items-center gap-2 mt-auto">
          <div className="min-w-0 text-muted-foreground text-xs truncate">
            {domain}
          </div>

          {/* Enhanced Price Badge */}
          <div
            className={`rounded-lg px-2.5 py-1.5 flex-shrink-0 bg-gradient-to-r border from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-900 shadow-md shadow-slate-300/30 dark:shadow-slate-800/30`}
          >
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-600 text-xs">
                {formatPrice(supplier.price!)}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Button */}
        <Button
          size="sm"
          variant="outline"
          asChild
          className="w-full h-7 px-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary-700 text-xs"
        >
          <a
            href={supplier.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
            Visit
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

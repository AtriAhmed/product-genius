import { Building2, ExternalLink, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Supplier } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SupplierCardProps {
  supplier: Supplier;
  compact?: boolean;
}

export default function SupplierCard({
  supplier,
  compact = true,
}: SupplierCardProps) {
  const handleVisit = () => toast(`Opening ${supplier.marketplace}`);

  const domain = supplier.url?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Card className="flex flex-col overflow-hidden !p-2 bg-gradient-to-br from-white dark:from-gray-900 via-primary/5 dark:via-primary/10 to-primary/10 dark:to-primary/20 shadow-sm transition-shadow duration-300">
      <CardContent className="flex flex-col space-y-2.5 h-full !p-2">
        {/* Header: Marketplace + Star */}
        <div className="flex items-center gap-2.5">
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary-500 shadow-md shadow-primary-500/30">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-foreground text-sm truncate">
                {"Product Genius"}
              </h4>
              <div className="flex items-center gap-1">
                <Star
                  className="flex-shrink-0 w-3.5 h-3.5 drop-shadow-sm text-yellow-400"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 font-semibold text-primary-700 dark:text-primary-300 text-xs truncate">
          {supplier?.notes}
        </div>

        {/* Price & Domain Row */}
        <div className="flex justify-between items-center gap-2 mt-auto">
          <div className="min-w-0 px-2 py-1 text-muted-foreground text-xs truncate">
            {domain}
          </div>

          {/* Enhanced Price Badge */}
          <div
            className={`rounded-lg px-2.5 py-1.5 flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 dark:shadow-primary-800/40`}
          >
            <div className="flex items-center gap-1">
              <span className="drop-shadow-sm font-bold text-white text-xs">
                {formatPrice(supplier.price!)}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Button */}
        <Button
          size="sm"
          variant="primary"
          className="w-full h-7 px-3 bg-gradient-to-r from-primary-600 to-primary-700 shadow-md hover:shadow-lg hover:saturate-75 text-xs transition-all duration-200"
        >
          <ShoppingCart className="w-3 h-3" />
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

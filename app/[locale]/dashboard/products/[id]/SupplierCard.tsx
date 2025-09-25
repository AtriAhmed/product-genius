import { Building2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Supplier } from "./types";

interface SupplierCardProps {
  supplier: Supplier;
  compact?: boolean;
}

export function SupplierCard({ supplier, compact = true }: SupplierCardProps) {
  const handleOrder = () => {
    toast.success(`Order requested from ${supplier.name}`);
  };

  return (
    <Card className={compact ? "p-1" : "p-2"}>
      <CardContent className={`${compact ? "p-2" : "p-3"} space-y-1`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Building2
                className={`${
                  compact ? "w-3 h-3" : "w-4 h-4"
                } text-primary flex-shrink-0`}
              />
              <h4
                className={`font-medium ${
                  compact ? "text-xs" : "text-sm"
                } truncate`}
              >
                {supplier.name}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <Star
                className={`${
                  compact ? "w-2.5 h-2.5" : "w-3 h-3"
                } text-yellow-400 fill-current`}
              />
              <span
                className={`${
                  compact ? "text-xs" : "text-xs"
                } text-muted-foreground`}
              >
                {supplier.rating}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className={`font-bold ${
                compact ? "text-xs" : "text-sm"
              } text-primary`}
            >
              {supplier.currency}
              {supplier.price}
            </div>
            <div
              className={`${
                compact ? "text-xs" : "text-xs"
              } text-muted-foreground`}
            >
              {supplier.deliveryTime}
            </div>
          </div>
        </div>
        <Button
          size={compact ? "sm" : "sm"}
          className={`w-full ${
            compact ? "h-6 text-xs" : "h-7 text-xs"
          } bg-primary-500 hover:bg-primary-600 text-white hover:text-white`}
          onClick={handleOrder}
        >
          Order Now
        </Button>
      </CardContent>
    </Card>
  );
}

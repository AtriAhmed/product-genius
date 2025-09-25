import { ExternalLink, Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Marketplace } from "./types";

interface MarketplaceCardProps {
  marketplace: Marketplace;
  compact?: boolean;
}

export function MarketplaceCard({
  marketplace,
  compact = true,
}: MarketplaceCardProps) {
  const handleVisit = () => {
    window.open(marketplace.url, "_blank");
  };

  return (
    <Card className={compact ? "p-1" : "p-2"}>
      <CardContent className={`${compact ? "p-2" : "p-3"} space-y-1`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Store
                className={`${
                  compact ? "w-3 h-3" : "w-4 h-4"
                } text-primary flex-shrink-0`}
              />
              <h4
                className={`font-medium ${
                  compact ? "text-xs" : "text-sm"
                } truncate`}
              >
                {marketplace.name}
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
                {marketplace.rating}
              </span>
            </div>
          </div>
          <div
            className={`font-bold ${
              compact ? "text-xs" : "text-sm"
            } text-primary flex-shrink-0`}
          >
            {marketplace.currency}
            {marketplace.price}
          </div>
        </div>
        <Button
          size={compact ? "sm" : "sm"}
          variant="outline"
          className={`w-full ${compact ? "h-6 text-xs" : "h-7 text-xs"}`}
          onClick={handleVisit}
        >
          <ExternalLink
            className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} mr-1`}
          />
          Visit Store
        </Button>
      </CardContent>
    </Card>
  );
}

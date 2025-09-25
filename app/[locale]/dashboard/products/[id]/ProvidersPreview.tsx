import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SupplierCard } from "./SupplierCard";
import { MarketplaceCard } from "./MarketplaceCard";
import { Supplier, Marketplace } from "./types";

interface ProvidersPreviewProps {
  suppliers: Supplier[];
  marketplaces: Marketplace[];
  onScrollToProviders: () => void;
}

export function ProvidersPreview({
  suppliers,
  marketplaces,
  onScrollToProviders,
}: ProvidersPreviewProps) {
  return (
    <>
      {/* Compact Suppliers & Marketplaces */}
      <div className="mt-4 space-y-4">
        <h3 className="text-lg font-semibold">Available From</h3>

        {/* Show first few suppliers */}
        {suppliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Our Suppliers
            </h4>
            <div className="grid xl:grid-cols-2 gap-2">
              {suppliers.slice(0, 2).map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Show first few marketplaces */}
        {marketplaces.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Marketplaces
            </h4>
            <div className="grid xl:grid-cols-2 gap-2">
              {marketplaces.slice(0, 2).map((marketplace) => (
                <MarketplaceCard
                  key={marketplace.id}
                  marketplace={marketplace}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* See More Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onScrollToProviders}
        >
          <ChevronDown className="w-4 h-4 mr-2" />
          See All Providers ({suppliers.length + marketplaces.length} total)
        </Button>
      </div>
    </>
  );
}

import { SupplierCard } from "./SupplierCard";
import { MarketplaceCard } from "./MarketplaceCard";
import { Supplier, Marketplace } from "./types";

interface AllProvidersProps {
  suppliers: Supplier[];
  marketplaces: Marketplace[];
}

export function AllProviders({ suppliers, marketplaces }: AllProvidersProps) {
  return (
    <div id="all-providers" className="mt-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold">All Providers</h2>
        <p className="text-sm text-muted-foreground">
          Compare prices from all available sources
        </p>
      </div>

      {/* All Suppliers */}
      {suppliers.length > 0 && (
        <div className="space-y-1 mb-4">
          <h3 className="text-lg font-semibold">Our Suppliers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </div>
      )}

      {/* All Marketplaces */}
      {marketplaces.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Marketplaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {marketplaces.map((marketplace) => (
              <MarketplaceCard key={marketplace.id} marketplace={marketplace} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

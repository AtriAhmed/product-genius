import { Supplier } from "@/types";
import { Search } from "lucide-react";
import SupplierCard from "./SupplierCard";
import MarketplaceCard from "@/app/[locale]/dashboard/products/[id]/MarketplaceCard";

interface ProvidersPreviewProps {
  hasStore?: boolean;
  suppliers: Supplier[];
  price?: number;
  compareAtPrice?: number;
  isImported: boolean;
  onScrollToProviders: () => void;
}

export function ProductSuppliers({
  hasStore = false,
  price,
  compareAtPrice,
  suppliers,
  isImported,
}: ProvidersPreviewProps) {
  if (!suppliers?.length)
    return (
      <>
        {/* Compact Suppliers & Marketplaces */}
        <div className="mt-4">
          <h3 className="font-semibold text-lg">Available From</h3>

          <div className="flex flex-col justify-center items-center space-y-2 py-8 text-center">
            <Search className="w-8 h-8 text-muted-foreground" />
            <div className="font-bold text-muted-foreground text-sm">
              No providers available for this product.
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      {/* Compact Suppliers & Marketplaces */}
      <div className="space-y-4 mt-4">
        <h3 className="font-semibold text-lg">Available From</h3>

        {/* Show first few suppliers */}
        {price && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground text-sm">
              Our Suppliers
            </h4>
            <div className="gap-2 grid xl:grid-cols-2">
              <SupplierCard
                hasStore={hasStore}
                price={price}
                compareAtPrice={compareAtPrice}
                compact={true}
                isImported={isImported}
              />
            </div>
          </div>
        )}

        {/* Show first few marketplaces */}
        {suppliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground text-sm">
              Marketplaces
            </h4>
            <div className="gap-2 grid xl:grid-cols-2">
              {suppliers.map((supplier) => (
                <MarketplaceCard
                  key={supplier.id}
                  supplier={supplier}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

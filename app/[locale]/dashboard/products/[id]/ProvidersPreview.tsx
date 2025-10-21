import { Supplier } from "@/types";
import { Search } from "lucide-react";
import SupplierCard from "./SupplierCard";
import MarketplaceCard from "@/app/[locale]/dashboard/products/[id]/MarketplaceCard";

interface ProvidersPreviewProps {
  suppliers: Supplier[];
  onScrollToProviders: () => void;
}

export function ProvidersPreview({ suppliers }: ProvidersPreviewProps) {
  console.log("-------------------- suppliers --------------------");
  console.log(suppliers);

  const externalSuppliers = suppliers.filter(
    (supplier) => supplier.isInternal === false
  );
  const internalSuppliers = suppliers.filter(
    (supplier) => supplier.isInternal === true
  );

  if (!suppliers?.length)
    return (
      <>
        {/* Compact Suppliers & Marketplaces */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Available From</h3>

          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Search className="w-8 h-8 text-muted-foreground" />
            <div className="text-sm font-bold text-muted-foreground">
              No providers available for this product.
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      {/* Compact Suppliers & Marketplaces */}
      <div className="mt-4 space-y-4">
        <h3 className="text-lg font-semibold">Available From</h3>

        {/* Show first few suppliers */}
        {internalSuppliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Our Suppliers
            </h4>
            <div className="grid xl:grid-cols-2 gap-2">
              {internalSuppliers.slice(0, 2).map((supplier) => (
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
        {externalSuppliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Marketplaces
            </h4>
            <div className="grid xl:grid-cols-2 gap-2">
              {externalSuppliers.slice(0, 2).map((supplier) => (
                <MarketplaceCard
                  key={supplier.id}
                  supplier={supplier}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* See More Button */}
        {/* <Button
          variant="outline"
          className="w-full"
          onClick={onScrollToProviders}
        >
          <ChevronDown className="w-4 h-4 mr-2" />
          See All Providers ({suppliers.length + externalSuppliers.length}{" "}
          total)
        </Button> */}
      </div>
    </>
  );
}

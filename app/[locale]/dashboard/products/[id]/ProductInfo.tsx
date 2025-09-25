import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product, ProductTranslation } from "./types";

interface ProductInfoProps {
  product: Product;
  translation: ProductTranslation | null;
  categoryTranslation: any;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

const currencyMap = Object.fromEntries(
  currencies.map((currency) => [currency.code, currency])
);

export function ProductInfo({
  product,
  translation,
  categoryTranslation,
  isLiked,
  onLike,
  onShare,
}: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Title and Status */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {translation?.title || "Untitled Product"}
            </h1>
            {categoryTranslation && (
              <Badge variant="secondary" className="mt-2">
                {categoryTranslation.title}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Price and SKU */}
      <div className="space-y-2">
        {product.suggestedPrice && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Suggested Price
            </div>
            <div className="text-3xl font-bold text-primary">
              {currencyMap[product.currency!]?.symbol || product.currency}
              {product.suggestedPrice}
            </div>
          </div>
        )}
        {product.sku && (
          <div className="text-sm text-muted-foreground">
            SKU: {product.sku}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Description</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {translation?.description || "No description available."}
        </p>
      </div>
    </div>
  );
}

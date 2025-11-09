import { Heart, Share2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product, ProductTranslation } from "@/types";
import ShopifyIcon from "@/assets/images/shopify.svg";
import sanitizeHtml from "sanitize-html";

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

const currencyMap = Object.fromEntries(currencies.map((currency) => [currency.code, currency]));

export function ProductInfo({ product, translation, categoryTranslation, isLiked, onLike, onShare }: ProductInfoProps) {
  const t = useTranslations("products");
  const isImportedToShopify = product.productMappings && product.productMappings.length > 0;
  const shopifyMapping = product.productMappings?.[0];

  return (
    <div className="space-y-6">
      {/* Shopify Import Alert */}
      {isImportedToShopify && (
        <div className="p-4 border border-green-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-gray-800/50">
          <div className="flex items-start gap-4">
            <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 rounded-lg bg-green-100 dark:bg-gray-700">
              <ShopifyIcon className="text-green-600 dark:text-gray-300" width={40} height={40} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="mb-2 font-semibold text-green-800 dark:text-gray-200 text-base">
                {t("product imported to shopify")}
              </h3>
              <p className="text-green-700 dark:text-gray-400 text-sm">
                {t("product imported to shopify description")}
              </p>
              {shopifyMapping?.shopifyProductId && shopifyMapping?.shopifyStore?.shop && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-green-300 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-gray-700 text-green-700 dark:text-gray-300"
                  >
                    <a
                      href={`https://${shopifyMapping.shopifyStore.shop}/admin/products/${shopifyMapping.shopifyProductId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ShopifyIcon className="text-green-600 dark:text-gray-300" width={16} height={16} />
                      {t("view in shopify admin")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Title and Status */}
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="font-bold text-3xl tracking-tight">{translation?.title || "Untitled Product"}</h1>
            {categoryTranslation && (
              <Badge variant="secondary" className="mt-2">
                {categoryTranslation.title}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onLike} className={isLiked ? "text-red-500" : ""}>
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
        {product.sellingPrice && (
          <div>
            <div className="mb-1 text-muted-foreground text-sm">Suggested Selling Price</div>
            <div className="font-bold text-primary text-3xl">
              {currencyMap[product.currency!]?.symbol || product.currency}
              {product.sellingPrice}
            </div>
          </div>
        )}
        {product.sku && <div className="text-muted-foreground text-sm">SKU: {product.sku}</div>}
      </div>

      {/* Description */}
      <div
        className="max-w-none [&_blockquote]:my-4 [&_h1]:my-4 [&_h2]:my-3 [&_h3]:my-3 [&_h4]:my-2 [&_h5]:my-2 [&_h6]:my-2 [&_li]:my-1 [&_ol]:my-2 [&_ul]:my-2 [&_blockquote]:pl-4 [&_blockquote]:border-border [&_blockquote]:border-l-4 [&_h5]:font-medium [&_h6]:font-medium [&_h3]:font-semibold [&_h4]:font-semibold [&_h1]:font-bold [&_h2]:font-bold [&_strong]:font-bold [&_h6]:text-xs [&_h5]:text-sm [&_h4]:text-base [&_h3]:text-lg [&_h2]:text-xl [&_h1]:text-2xl [&_s]:line-through [&_blockquote]:italic [&_em]:italic whitespace-pre-wrap prose prose-sm"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(translation?.description || "No description available.", {
            allowedTags: false,
            allowedAttributes: false,
          }),
        }}
      />
    </div>
  );
}

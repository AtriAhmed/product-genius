import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Tag } from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  orderCount: number;
  totalQuantity: number;
};

type UserTopProductsProps = {
  data: Product[];
};

export default function UserTopProducts({ data }: UserTopProductsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Your Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-muted-foreground text-center">You haven't ordered any products yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Your Favorite Products
          <span className="font-normal text-muted-foreground text-sm">Products you order most</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((product, index) => (
            <div
              key={product.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 font-semibold text-primary">
                  #{index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <ShoppingCart className="w-3 h-3" />
                      {product.orderCount} {product.orderCount === 1 ? "order" : "orders"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-lg">{product.totalQuantity}</div>
                <div className="text-muted-foreground text-xs">
                  {product.totalQuantity === 1 ? "item" : "items"} total
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length >= 10 && (
          <div className="mt-4 pt-4 border-t text-muted-foreground text-xs text-center">Showing top 10 products</div>
        )}
      </CardContent>
    </Card>
  );
}

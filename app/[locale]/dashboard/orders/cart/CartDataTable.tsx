"use client";

import { Product } from "@/types";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getMediaUrl } from "@/lib/utils";
import EmptyCart from "@/app/[locale]/dashboard/orders/cart/EmptyCart";
import { useTranslations } from "next-intl";

type CartProduct = Product & {
  quantity: number;
};

type CartDataTableProps = {
  cartProducts: CartProduct[];
  onQuantityChange: (productId: number, newQuantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
  isLoading: boolean;
};

export default function CartDataTable({
  cartProducts,
  onQuantityChange,
  onRemoveFromCart,
  onClearCart,
  isLoading,
}: CartDataTableProps) {
  const t = useTranslations("orders");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="w-32 h-6" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <Skeleton className="w-20 h-20 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-1/2 h-4" />
                  <Skeleton className="w-24 h-6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg">{t("cart items")}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="hover:bg-red-50 text-red-500 hover:text-red-700"
        >
          {t("clear all")}
        </Button>
      </CardHeader>
      <CardContent className="!p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t("image")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead className="w-24">{t("price")}</TableHead>
                <TableHead className="w-32">{t("quantity")}</TableHead>
                <TableHead className="w-24">{t("total")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartProducts?.length > 0 ? (
                cartProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-16 h-16 overflow-hidden rounded-md bg-gray-100">
                        {product.media?.[0]?.url ? (
                          <img
                            src={getMediaUrl(
                              product.media[0].type === "IMAGE"
                                ? product.media[0].url
                                : product.media[0].poster
                            )}
                            alt={product.translations?.[0]?.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex justify-center items-center w-full h-full bg-gray-200">
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <h4 className="font-medium text-sm">
                          {product.translations?.[0]?.title ||
                            "Untitled Product"}
                        </h4>
                        <p className="max-w-xs text-muted-foreground text-sm truncate">
                          {product.translations?.[0]?.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.suggestedPrice || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onQuantityChange(product.id, product.quantity - 1)
                          }
                          disabled={product.quantity <= 1}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 font-medium text-sm text-center">
                          {product.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onQuantityChange(product.id, product.quantity + 1)
                          }
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(
                        (product.suggestedPrice || 0) * product.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveFromCart(product.id)}
                        className="w-8 h-8 p-0 hover:bg-red-50 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <EmptyCart />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

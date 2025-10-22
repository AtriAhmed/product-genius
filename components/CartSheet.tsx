"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppProvider } from "@/contexts/AppProvider";
import { Product } from "@/types";
import { formatPrice, getMediaUrl } from "@/lib/utils";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/use-is-mounted";

type CartProduct = Product & {
  quantity: number;
};

async function fetcher(productIds: number[]) {
  if (productIds.length === 0) return [];

  const response = await axios.post("/api/products/bulk", { productIds });
  return response.data;
}

export default function CartSheet() {
  const { cart, removeFromCart, updateQuantity, getCartItemCount, clearCart } =
    useAppProvider();
  const [open, setOpen] = useState(false);
  const t = useTranslations("orders");
  const isMounted = useIsMounted();

  // Get product IDs from cart
  const productIds = cart.map((item) => item.productId);

  // SWR hook for data fetching
  const {
    data: products,
    error,
    isLoading,
  } = useSWR(
    productIds.length > 0 ? ["cart-sheet-products", productIds] : null,
    () => fetcher(productIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Handle SWR error
  if (error) {
    toast.error(t("failed to load"));
  }

  // Map products with their quantities from cart
  const cartProducts: CartProduct[] = products
    ? products.map((product: Product) => {
        const cartItem = cart.find((item) => item.productId === product.id);
        return { ...product, quantity: cartItem?.quantity || 0 };
      })
    : [];

  const totalPrice = cartProducts.reduce(
    (total, product) =>
      total + (product.suggestedPrice || 0) * product.quantity,
    0
  );

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const cartItemCount = getCartItemCount();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {isMounted && cartItemCount > 0 && (
            <span className="-top-2 -right-2 absolute flex justify-center items-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs">
              {cartItemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] px-2">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t("shopping cart")} ({cartItemCount})
          </SheetTitle>
          <SheetDescription>{t("cart items")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {isLoading && !isMounted ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-md bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-3/4 h-4 rounded bg-gray-200"></div>
                      <div className="w-1/2 h-3 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cartProducts.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("your cart is empty")}</p>
              <p className="text-sm">{t("add some products to get started")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-100">
                      {product.media?.[0]?.url ? (
                        <img
                          src={getMediaUrl(
                            product.media[0].type === "IMAGE"
                              ? product.media[0].url
                              : product.media[0].poster
                          )}
                          alt={product.translations?.[0]?.title || t("product")}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full rounded-md bg-gray-200">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {product.translations?.[0]?.title || t("product")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {formatPrice(product.suggestedPrice || 0)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              product.quantity - 1
                            )
                          }
                          disabled={product.quantity <= 1}
                          className="w-6 h-6 p-0"
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
                            handleQuantityChange(
                              product.id,
                              product.quantity + 1
                            )
                          }
                          className="w-6 h-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(product.id)}
                      className="w-6 h-6 p-0 hover:bg-red-50 text-red-500 hover:text-red-700"
                      title={t("remove from cart")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t("total")}:</span>
                  <span className="font-bold text-lg">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/dashboard/orders/cart"
                    onClick={() => setOpen(false)}
                  >
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t("view full cart")}
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="w-full hover:bg-red-50 text-red-500 hover:text-red-700"
                  >
                    {t("clear cart")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

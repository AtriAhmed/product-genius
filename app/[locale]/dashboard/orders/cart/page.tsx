"use client";

import { useAppProvider } from "@/contexts/AppProvider";
import { Product, DeliveryInfo } from "@/types";
import axios from "axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import useSWR from "swr";
import CartDataTable from "./CartDataTable";
import OrderSummary from "./OrderSummary";
import DeliveryInfoForm from "@/app/[locale]/dashboard/orders/cart/DeliveryInfo";
import CheckoutDialog from "./CheckoutDialog";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useEffect, useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useLocalStorage from "@/hooks/use-local-storage";
import equal from "deep-equal";
import { useRouter } from "@/i18n/navigation";

type CartProduct = Product & {
  quantity: number;
};

async function fetcher(productIds: number[]) {
  if (productIds.length === 0) return [];

  const response = await axios.post("/api/products/bulk", { productIds });
  return response.data;
}

const deliveryInfoSchema = z.object({
  deliveryName: z.string().min(1, "Name is required"),
  deliveryPhone: z.string().min(1, "Phone is required"),
  deliveryEmail: z.email("Invalid email"),
  deliveryAddress1: z.string().min(1, "Address is required"),
  deliveryAddress2: z.string().optional(),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryState: z.string().min(1, "State is required"),
  deliveryZip: z.string().min(1, "ZIP code is required"),
  deliveryCountry: z.string().min(1, "Country is required"),
});

export type DeliveryInfoData = z.infer<typeof deliveryInfoSchema>;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartItemCount, clearCart } =
    useAppProvider();
  const t = useTranslations("orders");
  const isMounted = useIsMounted();
  const [deliveryInfo, setDeliveryInfo] = useLocalStorage<
    Partial<DeliveryInfo>
  >("delivery-info", {});

  const form = useForm<DeliveryInfo>({
    resolver: zodResolver(deliveryInfoSchema),
    mode: "onChange",
    defaultValues: deliveryInfo,
  });

  const { watch } = form;

  const watchedValues = watch();

  useEffect(() => {
    if (!equal(watchedValues, deliveryInfo)) setDeliveryInfo(watchedValues);
  }, [watchedValues]);

  // Get product IDs from cart
  const productIds = cart.map((item) => item.productId);

  // SWR hook for data fetching
  const {
    data: products,
    error,
    isLoading,
  } = useSWR(
    productIds.length > 0 ? ["cart-products", productIds] : null,
    () => fetcher(productIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Handle SWR error
  if (error) {
    toast.error("Failed to load cart products");
  }

  // Map products with their quantities from cart
  const cartProducts: CartProduct[] = products
    ? products.map((product: Product) => {
        const supplier = product?.suppliers?.find((s) => s.isInternal);
        const cartItem = cart.find((item) => item.productId === product.id);
        return {
          ...product,
          quantity: cartItem?.quantity || 0,
          suggestedPrice: supplier ? supplier.price : product.sellingPrice,
        };
      })
    : [];

  const totalPrice = cartProducts.reduce(
    (total, product) => total + (product.sellingPrice || 0) * product.quantity,
    0
  );

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  const handleProceedToCheckout = async () => {
    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t("please enter valid delivery info"));
      return;
    }

    setShowCheckoutDialog(true);
  };

  const handleOrderSuccess = () => {
    // Clear cart and show success message
    clearCart();
    toast.success(t("order placed successfully"));
    // Optionally redirect to orders page
    router.push("/dashboard/orders");
  };

  const cartItemCount = getCartItemCount();

  return (
    <div className="px-4 py-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-gray-900 dark:text-gray-100 text-2xl">
            {t("shopping cart")} ({!isMounted ? 0 : cartItemCount} {t("items")})
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("review and modify your cart items before checkout")}
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-6 lg:col-span-2">
            <CartDataTable
              cartProducts={cartProducts}
              onQuantityChange={handleQuantityChange}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              isLoading={isLoading || !isMounted}
            />

            <DeliveryInfoForm form={form} />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              totalPrice={totalPrice}
              cartItemCount={cartItemCount}
              onProceedToCheckout={handleProceedToCheckout}
              isLoading={isLoading || !isMounted || isSubmitting}
            />
          </div>
        </div>

        {/* Checkout Dialog */}
        <CheckoutDialog
          isOpen={showCheckoutDialog}
          onClose={() => setShowCheckoutDialog(false)}
          cartItems={cart}
          totalPrice={totalPrice}
          deliveryInfo={watchedValues as DeliveryInfoData}
          onOrderSuccess={handleOrderSuccess}
        />
      </div>
    </div>
  );
}

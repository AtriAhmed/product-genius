import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, User, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeliveryInfoData } from "./page";

type CartItem = {
  productId: number;
  quantity: number;
};

type Props = {
  cartItems: CartItem[];
  totalPrice: number;
  deliveryInfo: DeliveryInfoData;
  onNext: () => void;
};

export default function CheckoutReviewStep({
  cartItems,
  totalPrice,
  deliveryInfo,
  onNext,
}: Props) {
  const t = useTranslations("orders");
  const tPricing = useTranslations("pricing");

  const isDeliveryInfoComplete =
    deliveryInfo.deliveryName &&
    deliveryInfo.deliveryPhone &&
    deliveryInfo.deliveryEmail &&
    deliveryInfo.deliveryAddress1 &&
    deliveryInfo.deliveryCity &&
    deliveryInfo.deliveryState &&
    deliveryInfo.deliveryZip &&
    deliveryInfo.deliveryCountry;

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Order Summary Card */}
      <Card className="flex flex-col grow h-0 overflow-y-auto border-primary-200 dark:border-primary-800 bg-white/80 dark:bg-neutral-800/80 shadow-lg backdrop-blur-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
            <Package className="w-4 h-4" />
            <h3 className="font-semibold text-sm">{t("order summary")}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {t("items")} ({cartItems.length})
              </span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("shipping")}</span>
              <span className="font-medium text-green-600">
                {t("free shipping")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("tax")}</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {t("calculated at checkout")}
              </span>
            </div>
            <hr className="border-primary-200 dark:border-primary-700" />
            <div className="flex justify-between font-bold text-primary-900 dark:text-primary-100 text-base">
              <span>{t("total")}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information Card */}
      <Card className="border-primary-200 dark:border-primary-800 bg-white/80 dark:bg-neutral-800/80 shadow-lg backdrop-blur-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
              <MapPin className="w-4 h-4" />
              <h3 className="font-semibold text-sm">
                {t("delivery information")}
              </h3>
            </div>
            {isDeliveryInfoComplete ? (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs">
                ✓ {t("complete")}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                {t("incomplete")}
              </Badge>
            )}
          </div>

          {isDeliveryInfoComplete ? (
            <div className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-3 h-3 mt-0.5 text-primary-600 dark:text-primary-400" />
                <div>
                  <div className="font-medium">{deliveryInfo.deliveryName}</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-xs">
                    {deliveryInfo.deliveryPhone} • {deliveryInfo.deliveryEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 mt-0.5 text-primary-600 dark:text-primary-400" />
                <div className="text-xs">
                  <div>{deliveryInfo.deliveryAddress1}</div>
                  {deliveryInfo.deliveryAddress2 && (
                    <div>{deliveryInfo.deliveryAddress2}</div>
                  )}
                  <div>
                    {deliveryInfo.deliveryCity}, {deliveryInfo.deliveryState}{" "}
                    {deliveryInfo.deliveryZip}
                  </div>
                  <div>{deliveryInfo.deliveryCountry}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400 text-sm">
              {t("please enter valid delivery info")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-primary-600 hover:from-primary-700 to-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl text-white hover:scale-[1.02] transition-all duration-200"
        size="lg"
        disabled={!isDeliveryInfoComplete || cartItems.length === 0}
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        {tPricing("continue to payment")}
      </Button>

      <p className="text-neutral-600 dark:text-neutral-400 text-xs text-center">
        {t("secure checkout powered by stripe")}
      </p>
    </div>
  );
}

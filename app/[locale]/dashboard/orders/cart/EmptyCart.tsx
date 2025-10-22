"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function EmptyCart() {
  const t = useTranslations("orders");

  return (
    <div className="py-12 text-center">
      <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
      <h2 className="mb-2 font-bold text-gray-900 dark:text-gray-100 text-2xl">
        {t("your cart is empty")}
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {t("add some products to get started")}
      </p>
      <Button asChild>
        <Link href="/dashboard/products">{t("browse products")}</Link>
      </Button>
    </div>
  );
}

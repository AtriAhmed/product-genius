"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Locked Product Card Component
export default function LockedProductCard() {
  const t = useTranslations("products");

  return (
    <Card className="group flex flex-col gap-2 h-full overflow-hidden pt-0 pb-2 opacity-75 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative h-[200px] overflow-hidden bg-gradient-to-br from-primary-50 dark:from-primary-900/20 via-primary-100 dark:via-primary-800/30 to-primary-200 dark:to-primary-700/40">
        {/* Premium Badge */}
        <div
          className="top-3 right-3 z-20 absolute flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-primary-500 shadow-sm backdrop-blur-sm select-none"
          aria-hidden
        >
          <Crown className="w-4 h-4 text-white" />
          <span className="font-semibold text-[12px] text-white">Premium</span>
        </div>

        {/* Premium Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="top-4 left-4 absolute w-8 h-8 border-2 border-primary-400 rounded-full"></div>
          <div className="top-12 right-8 absolute w-6 h-6 border-2 border-primary-300 rounded-full"></div>
          <div className="bottom-8 left-8 absolute w-4 h-4 border-2 border-primary-500 rounded-full"></div>
          <div className="right-4 bottom-4 absolute w-10 h-10 border-2 border-primary-200 rounded-full"></div>
        </div>

        {/* Lock Icon Overlay */}
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="p-6 border border-primary-300/30 rounded-full bg-primary-500/20 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-primary-600 dark:text-primary-300" />
          </div>
        </div>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-100/30 dark:from-primary-900/30 via-transparent to-transparent" />
      </div>

      <CardContent className="flex flex-col grow !p-2 !pt-0">
        <div className="flex flex-col space-y-2 h-full">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-base line-clamp-2">Premium Product</h3>
          </div>

          <Badge variant="secondary" className="w-fit !bg-primary-500 text-white text-xs">
            Premium Feature
          </Badge>

          <p className="text-muted-foreground text-sm line-clamp-3">
            Upgrade to unlock premium products and access advanced features for your store.
          </p>

          {/* Upgrade Button */}
          <div className="mt-auto pt-2">
            <Link href="/dashboard/billing">
              <Button
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 dark:shadow-primary-800/40 hover:saturate-200 text-white"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

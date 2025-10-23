"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderDetailsPage() {
  const t = useTranslations("orders");
  const params = useParams();
  const orderId = params.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 py-2 container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              Order Details
            </h1>
            <p className="mt-2 text-muted-foreground">Order ID: {orderId}</p>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="p-8 border rounded-lg text-center">
          <h2 className="mb-2 font-semibold text-xl">Order Details</h2>
          <p className="text-muted-foreground">
            This page will display detailed information about order {orderId}.
            <br />
            Implementation coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { CreditCard, Lock, Zap, Shield, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function SubscriptionRequired() {
  const t = useTranslations("billing");

  return (
    <div className="flex flex-1 justify-center items-center min-h-[60vh] p-8">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-muted-foreground/20 border-dashed bg-gradient-to-br from-background to-muted/20 text-center">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center items-center w-20 h-20 mx-auto border border-primary/20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-bold text-3xl">{t("no subscription")}</CardTitle>
              <p className="max-w-md mx-auto text-muted-foreground text-lg">{t("no subscription description")}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div className="flex flex-col items-center gap-3 p-4 border border-primary/10 rounded-lg bg-primary/5">
                <Zap className="w-6 h-6 text-primary" />
                <span className="font-medium text-sm text-center">Premium Features</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-4 border border-primary/10 rounded-lg bg-primary/5">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-medium text-sm text-center">Secure Platform</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-4 border border-primary/10 rounded-lg bg-primary/5">
                <Users className="w-6 h-6 text-primary" />
                <span className="font-medium text-sm text-center">24/7 Support</span>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/dashboard/billing" className="block">
                <Button variant="primary" size="lg" className="w-full max-w-sm h-auto mx-auto py-3 text-base">
                  <CreditCard className="w-5 h-5" />
                  View Available Plans
                </Button>
              </Link>
              <p className="text-muted-foreground text-xs">Choose from flexible pricing options to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

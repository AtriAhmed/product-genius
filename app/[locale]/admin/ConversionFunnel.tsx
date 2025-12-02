"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CreditCard, ShoppingCart, TrendingUp } from "lucide-react";

type FunnelData = {
  visitors: number;
  subscribers: number;
  paidCustomers: number;
  conversionRate: {
    visitorToSubscriber: number;
    subscriberToPaid: number;
    overallConversion: number;
  };
};

type ConversionFunnelProps = {
  data: FunnelData;
};

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
  const steps = [
    {
      label: "Visitors",
      value: data.visitors,
      icon: Users,
      color: "bg-blue-500",
      percentage: 100,
    },
    {
      label: "Subscribers",
      value: data.subscribers,
      icon: CreditCard,
      color: "bg-green-500",
      percentage: (data.subscribers / data.visitors) * 100,
    },
    {
      label: "Paid Customers",
      value: data.paidCustomers,
      icon: ShoppingCart,
      color: "bg-purple-500",
      percentage: (data.paidCustomers / data.visitors) * 100,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Conversion Funnel
          <span className="font-normal text-muted-foreground text-sm">User journey analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Funnel Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.label} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{step.label}</h3>
                        <div className="text-right">
                          <div className="font-bold text-2xl">{step.value.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">{step.percentage.toFixed(1)}% of visitors</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <Progress value={step.percentage} className="h-2" />
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="-bottom-4 left-6 absolute w-0 h-4 border-muted-foreground/50 border-l-2 border-dashed" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Conversion Rates */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3 pt-6 border-t">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="font-bold text-blue-600 text-2xl">
                {data.conversionRate.visitorToSubscriber.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-sm">Visitor → Subscriber</div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="font-bold text-green-600 text-2xl">
                {data.conversionRate.subscriberToPaid.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-sm">Subscriber → Paid</div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="font-bold text-purple-600 text-2xl">
                {data.conversionRate.overallConversion.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-sm">Overall Conversion</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

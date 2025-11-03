"use client";

import { MapPin, User, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";

type DeliveryInformationProps = {
  order: Order;
  t: (key: string) => string;
};

export default function DeliveryInformation({
  order,
  t,
}: DeliveryInformationProps) {
  // Don't render the component if there's no delivery information
  if (!order.deliveryName && !order.deliveryAddress1) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {t("delivery information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.deliveryName && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{order.deliveryName}</span>
          </div>
        )}

        {order.deliveryPhone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{order.deliveryPhone}</span>
          </div>
        )}

        {order.deliveryEmail && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{order.deliveryEmail}</span>
          </div>
        )}

        {order.deliveryAddress1 && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1 text-sm">
                  <p>{order.deliveryAddress1}</p>
                  {order.deliveryAddress2 && <p>{order.deliveryAddress2}</p>}
                  <p>
                    {[
                      order.deliveryCity,
                      order.deliveryState,
                      order.deliveryZip,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.deliveryCountry && <p>{order.deliveryCountry}</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type DeliveryInfo } from "@/types";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useLocalStorage from "@/hooks/use-local-storage";
import { useEffect } from "react";
import equal from "deep-equal";

type DeliveryInfoProps = {
  isLoading?: boolean;
  form: ReturnType<typeof useForm<DeliveryInfo>>;
};

export default function DeliveryInfo({
  isLoading = false,
  form,
}: DeliveryInfoProps) {
  const t = useTranslations("orders");

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("delivery information")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">{t("contact information")}</h3>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryName">{t("full name")}</Label>
                <Input
                  id="deliveryName"
                  {...register("deliveryName")}
                  placeholder={t("enter full name")}
                  disabled={isLoading}
                />
                {errors.deliveryName && (
                  <p className="text-destructive text-sm">
                    {errors.deliveryName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryPhone">{t("phone number")}</Label>
                <Input
                  id="deliveryPhone"
                  {...register("deliveryPhone")}
                  placeholder={t("enter phone number")}
                  disabled={isLoading}
                />
                {errors.deliveryPhone && (
                  <p className="text-destructive text-sm">
                    {errors.deliveryPhone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryEmail">{t("email address")}</Label>
              <Input
                id="deliveryEmail"
                type="email"
                {...register("deliveryEmail")}
                placeholder={t("enter email address")}
                disabled={isLoading}
              />
              {errors.deliveryEmail && (
                <p className="text-destructive text-sm">
                  {errors.deliveryEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">{t("delivery address")}</h3>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress1">{t("address line 1")}</Label>
              <Input
                id="deliveryAddress1"
                {...register("deliveryAddress1")}
                placeholder={t("enter street address")}
                disabled={isLoading}
              />
              {errors.deliveryAddress1 && (
                <p className="text-destructive text-sm">
                  {errors.deliveryAddress1.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress2">
                {t("address line 2")} ({t("optional")})
              </Label>
              <Input
                id="deliveryAddress2"
                {...register("deliveryAddress2")}
                placeholder={t("apartment, suite, etc")}
                disabled={isLoading}
              />
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryCity">{t("city")}</Label>
                <Input
                  id="deliveryCity"
                  {...register("deliveryCity")}
                  placeholder={t("enter city")}
                  disabled={isLoading}
                />
                {errors.deliveryCity && (
                  <p className="text-destructive text-sm">
                    {errors.deliveryCity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryState">{t("state/province")}</Label>
                <Input
                  id="deliveryState"
                  {...register("deliveryState")}
                  placeholder={t("enter state")}
                  disabled={isLoading}
                />
                {errors.deliveryState && (
                  <p className="text-destructive text-sm">
                    {errors.deliveryState.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryZip">{t("zip/postal code")}</Label>
                <Input
                  id="deliveryZip"
                  {...register("deliveryZip")}
                  placeholder={t("enter zip code")}
                  disabled={isLoading}
                />
                {errors.deliveryZip && (
                  <p className="text-destructive text-sm">
                    {errors.deliveryZip.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryCountry">{t("country")}</Label>
              <Input
                id="deliveryCountry"
                {...register("deliveryCountry")}
                placeholder={t("enter country")}
                disabled={isLoading}
              />
              {errors.deliveryCountry && (
                <p className="text-destructive text-sm">
                  {errors.deliveryCountry.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

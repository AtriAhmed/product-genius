"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function PricingSection() {
  const t = useTranslations("pricing");

  const plans = [
    {
      name: t("basic"),
      price: "$29",
      description: t("perfect for getting started with product research"),
      features: [
        t("50 product searches per day"),
        t("basic analytics"),
        t("email support"),
      ],
      popular: false,
    },
    {
      name: t("pro"),
      price: "$99",
      description: t("for serious sellers scaling their business"),
      features: [
        t("200 product searches per day"),
        t("advanced analytics"),
        t("shopify integration"),
        t("priority support"),
      ],
      popular: true,
    },
    {
      name: t("enterprise"),
      price: "$299",
      description: t("for agencies and high-volume sellers"),
      features: [
        t("unlimited product searches"),
        t("all pro features"),
        t("multiple store integration"),
        t("dedicated account manager"),
        t("api access"),
      ],
      popular: false,
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            {t("pricing")}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("simple transparent pricing")}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto">
            {t("choose the plan that fits your business needs")}
          </p>
        </div>

        {/* Plans */}
        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 bg-muted-background rounded-2xl shadow-sm flex flex-col border ${
                plan.popular ? "border-2 border-primary-500" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 px-4 py-1 bg-primary-500 text-white font-semibold rounded-full text-xs tracking-wide">
                  {t("popular")}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-4 flex items-baseline text-foreground">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-xl font-semibold">
                    /{t("month")}
                  </span>
                </p>
                <p className="mt-6 text-muted-foreground">{plan.description}</p>

                <ul role="list" className="mt-6 space-y-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <Check className="text-primary-500 h-6 w-6 flex-shrink-0" />
                      <span className="ml-3 text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/signup"
                className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium bg-primary-500 text-white hover:bg-primary-600"
              >
                {t("get started")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

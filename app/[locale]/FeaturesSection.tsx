"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, ShoppingCart, BarChart3, Globe } from "lucide-react";
import FeatureCard from "@/app/[locale]/FeatureCard";

export default function FeaturesSection() {
  const t = useTranslations("home");

  const features = [
    {
      icon: TrendingUp,
      title: t("ai powered research title"),
      description: t("ai powered research description"),
      delay: 0,
    },
    {
      icon: ShoppingCart,
      title: t("one click import title"),
      description: t("one click import description"),
      delay: 100,
    },
    {
      icon: BarChart3,
      title: t("profitability analytics title"),
      description: t("profitability analytics description"),
      delay: 200,
    },
    {
      icon: Globe,
      title: t("global supplier title"),
      description: t("global supplier description"),
      delay: 300,
    },
  ];

  return (
    <section id="features" className="py-12 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="lg:text-center"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-easing="ease-out-cubic"
        >
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            {t("section title")}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("main heading")}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400 lg:mx-auto">
            {t("section description")}
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

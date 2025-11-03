"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Target,
  Gem,
  Award,
} from "lucide-react";

interface CategoryTranslation {
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: string;
  translations: CategoryTranslation[];
  _count: {
    products: number;
  };
}

interface FallbackCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export default function PopularCategories() {
  const t = useTranslations("home");
  const { data: session, status } = useSession();
  const router = useRouter();

  const getFallbackCategories = (): FallbackCategory[] => [
    {
      id: "trending",
      title: t("trending now"),
      description: t("trending description"),
      icon: TrendingUp,
    },
    {
      id: "bestsellers",
      title: t("best sellers"),
      description: t("best sellers description"),
      icon: Crown,
    },
    {
      id: "profitable",
      title: t("high profit"),
      description: t("high profit description"),
      icon: Gem,
    },
  ];

  // Render with fallback categories
  const fallbackCategories = getFallbackCategories();

  return (
    <section
      id="niches"
      className="py-12 bg-gradient-to-br from-slate-50 dark:from-gray-900 via-blue-50 dark:via-gray-800 to-indigo-100 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="mb-3 font-bold text-gray-900 dark:text-white text-2xl md:text-3xl">
            {t("find products in categories")}
          </h3>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-base">
            {t("categories description")}
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10">
          {fallbackCategories.map((category, index) => {
            const IconComponent = category.icon;

            return (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-500 cursor-pointer transform"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 dark:from-primary-400/10 to-purple-500/5 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

                <div className="relative p-6">
                  {/* Icon with enhanced styling */}
                  <div className="inline-flex justify-center items-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg group-hover:shadow-xl text-white group-hover:scale-110 transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Content section */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 dark:group-hover:text-primary-400 dark:text-white group-hover:text-primary-600 text-lg transition-colors duration-300">
                      {category.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {category.description}
                    </p>

                    {/* Action area */}
                  </div>

                  {/* Floating elements */}
                  <div className="top-3 right-3 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

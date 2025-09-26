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

  const handleCategoryClick = (category?: Category) => {
    if (status === "loading") return;

    if (session) {
      router.push("/dashboard/products");
    } else {
      router.push("/auth/login");
    }
  };

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
      className="py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase mb-2">
            {t("popular categories")}
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t("find products in categories")}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("categories description")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fallbackCategories.map((category, index) => {
            const IconComponent = category.icon;

            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick()}
                className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 dark:from-primary-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

                <div className="relative p-6">
                  {/* Icon with enhanced styling */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mb-4">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Content section */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      {category.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Action area */}
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {t("explore category")}
                        </span>
                      </div>

                      {/* Arrow icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

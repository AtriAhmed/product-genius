"use client";

import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function ReadySection() {
  const t = useTranslations("home");
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="bg-primary-500 dark:bg-slate-950">
      <div className="lg:flex lg:justify-between lg:items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Heading */}
        <h2
          className="font-extrabold text-white dark:text-gray-100 text-3xl sm:text-4xl tracking-tight"
          data-aos="fade-up"
        >
          <span className="block">{t("ready to find your next winning product?")}</span>
          <span className="block text-primary-100 dark:text-gray-300">{t("start your free trial today")}</span>
        </h2>

        {/* Buttons */}
        <div className="flex mt-8 lg:mt-0 lg:shrink-0">
          <div className="inline-flex rounded-md shadow" data-aos="fade-up" data-aos-delay="100">
            <Link
              href={user ? (user.role === "USER" ? "/dashboard" : "/admin") : "/auth/register"}
              className="inline-flex justify-center items-center px-5 py-3 border border-transparent rounded-md bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium text-primary-500 dark:text-gray-100 text-base"
            >
              {t("get started")}
            </Link>
          </div>
          <div className="inline-flex ml-3 rounded-md shadow" data-aos="fade-up" data-aos-delay="200">
            <Link
              href="/pricing"
              className="inline-flex justify-center items-center px-5 py-3 border border-transparent rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 font-medium text-white text-base"
            >
              {t("view pricing")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

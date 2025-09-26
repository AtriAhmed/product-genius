"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ReadySection() {
  const t = useTranslations("home");

  return (
    <div className="bg-primary-500 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        {/* Heading */}
        <h2 className="text-3xl font-extrabold tracking-tight text-white dark:text-gray-100 sm:text-4xl">
          <span className="block">{t("headline")}</span>
          <span className="block text-primary-100 dark:text-gray-300">
            {t("subheadline")}
          </span>
        </h2>

        {/* Buttons */}
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              {t("get started")}
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
            >
              {t("view pricing")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

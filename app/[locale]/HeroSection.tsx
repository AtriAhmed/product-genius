"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import laptop from "@/assets/images/laptop.webp";

export default function HeroSection() {
  const t = useTranslations("home");

  return (
    <div className="relative bg-white dark:bg-background overflow-hidden min-h-screen lg:min-h-[calc(100vh-55px)]">
      <div className="max-w-7xl mx-auto h-full">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 h-full">
          {/* Skewed background shape for large screens */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-full lg:w-2/3 bg-white dark:bg-background transform -skew-x-12 origin-top-left"></div>

          <main className="relative mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">{t("find winning products")}</span>
                <span className="block text-primary-500">
                  {t("for your store")}
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 lg:max-w-md xl:max-w-lg">
                {t("ai powered description")}
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0">
                <div className="rounded-md shadow-lg">
                  <Link
                    href="/auth/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:py-4 md:text-lg md:px-10 transition-all duration-150 shadow-sm hover:shadow-md"
                  >
                    {t("start free trial")}
                  </Link>
                </div>
                <div className="sm:ml-3">
                  <Link
                    href="#features"
                    className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-muted hover:bg-gray-50 dark:hover:bg-muted-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:py-4 md:text-lg md:px-10 transition-all duration-150"
                  >
                    {t("learn more")}
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Hero Image - Responsive positioning */}
      <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 mt-8 lg:mt-0">
        {/* Clip path for large screens only */}
        <div
          className="hidden lg:block h-full"
          style={{ clipPath: "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
        >
          <Image
            className="h-full w-full object-cover"
            src={laptop}
            alt={t("laptop")}
            width={1200}
            height={630}
            priority
          />
        </div>

        {/* Regular image for mobile/tablet */}
        <div className="lg:hidden">
          <Image
            className="h-56 w-full object-cover sm:h-72 md:h-96 rounded-lg shadow-xl mx-auto max-w-md sm:max-w-lg md:max-w-2xl"
            src={laptop}
            alt={t("laptop")}
            width={1200}
            height={630}
            priority
          />
        </div>
      </div>
    </div>
  );
}

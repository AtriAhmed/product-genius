"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import laptop from "@/assets/images/laptop.webp";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("home");
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="relative min-h-screen lg:min-h-[calc(100vh-var(--navbar-height))] overflow-hidden bg-white dark:bg-background">
      <div className="max-w-7xl h-full mx-auto">
        <div className="z-10 relative lg:w-full lg:max-w-2xl h-full pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          {/* Skewed background shape for large screens */}
          <div className="hidden lg:block left-0 absolute inset-y-0 w-full lg:w-2/3 bg-white dark:bg-background -skew-x-12 origin-top-left transform"></div>

          <main className="relative max-w-7xl mx-auto mt-10 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28 px-4 sm:px-6 lg:px-8">
            <div className="lg:text-left sm:text-center">
              <h1 className="font-extrabold text-foreground text-4xl sm:text-5xl lg:text-5xl md:text-6xl xl:text-6xl tracking-tight">
                <span className="block" data-aos="fade-up">
                  {t("find winning products")}
                </span>
                <span className="block text-primary-500" data-aos="fade-up" data-aos-delay="100">
                  {t("for your store")}
                </span>
              </h1>
              <p
                className="lg:max-w-md xl:max-w-lg sm:max-w-xl sm:mx-auto lg:mx-0 mt-3 sm:mt-5 md:mt-5 text-gray-600 dark:text-gray-400 text-base sm:text-lg md:text-xl"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {t("ai powered description")}
              </p>
              <div className="sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 mt-5 sm:mt-8">
                <div className="rounded-md shadow-lg" data-aos="fade-up" data-aos-delay="300">
                  <Link
                    href={user ? (user.role === "USER" ? "/dashboard" : "/admin") : "/auth/register"}
                    className="flex justify-center items-center w-full px-8 md:px-10 py-3 md:py-4 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-500 hover:bg-primary-600 shadow-sm hover:shadow-md font-medium text-white text-base md:text-lg transition-all duration-150"
                  >
                    {t("start free trial")}
                  </Link>
                </div>
                <div className="sm:ml-3" data-aos="fade-up" data-aos-delay="400">
                  <Link
                    href="#features"
                    className="flex justify-center items-center w-full px-8 md:px-10 py-3 md:py-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white hover:bg-gray-50 dark:bg-muted dark:hover:bg-muted-background font-medium text-gray-700 dark:text-gray-300 text-base md:text-lg transition-all duration-150"
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
      <div className="lg:right-0 lg:absolute relative lg:inset-y-0 lg:w-1/2 mt-8 lg:mt-0">
        {/* Clip path for large screens only */}
        <div className="hidden lg:block h-full" style={{ clipPath: "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
          <Image
            className="w-full h-full object-cover"
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
            className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-56 sm:h-72 md:h-96 object-cover mx-auto rounded-lg shadow-xl"
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

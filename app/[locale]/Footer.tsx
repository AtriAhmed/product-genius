"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Languages,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <footer className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
        {/* Navigation */}
        <nav
          className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2"
          aria-label="Footer"
        >
          <Link
            href="/#features"
            className="text-base text-muted-foreground hover:text-primary-500 transition-colors"
          >
            {t("features")}
          </Link>
          <Link
            href="/#niches"
            className="text-base text-muted-foreground hover:text-primary-500 transition-colors"
          >
            {t("niches")}
          </Link>
          <Link
            href="/pricing"
            className="text-base text-muted-foreground hover:text-primary-500 transition-colors"
          >
            {t("pricing")}
          </Link>
        </nav>

        {/* Language Switcher */}
        <div className="flex justify-center lg:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary-500 transition-colors bg-transparent border border-muted rounded-md hover:border-primary-500">
              <Languages className="h-4 w-4" />
              <span>{t("language")}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                onClick={() => {
                  router.replace(pathname, { locale: "en", scroll: false });
                }}
                className="cursor-pointer"
              >
                {t("english")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.replace(pathname, { locale: "fr", scroll: false });
                }}
                className="cursor-pointer"
              >
                {t("french")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-8 flex justify-center space-x-6">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Facebook</span>
          <Facebook className="h-6 w-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Instagram</span>
          <Instagram className="h-6 w-6" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Twitter</span>
          <Twitter className="h-6 w-6" />
        </a>
      </div>

      {/* Copyright */}
      <p className="mt-8 text-center text-base text-muted-foreground">
        © {new Date().getFullYear()} ProductGenius.
      </p>
    </footer>
  );
}

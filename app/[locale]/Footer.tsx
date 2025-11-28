"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Languages, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <footer className="max-w-7xl overflow-hidden mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start gap-8">
        {/* Navigation */}
        <nav className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2" aria-label="Footer">
          <Link href="/#features" className="text-muted-foreground hover:text-primary-500 text-base transition-colors">
            {t("features")}
          </Link>
          <Link href="/#niches" className="text-muted-foreground hover:text-primary-500 text-base transition-colors">
            {t("niches")}
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-primary-500 text-base transition-colors">
            {t("pricing")}
          </Link>
        </nav>

        {/* Language Switcher */}
        <div className="flex justify-center lg:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 border border-slate-400 hover:border-primary-500 rounded-md bg-transparent text-muted-foreground hover:text-primary-500 text-sm transition-colors">
              <Languages className="w-4 h-4" />
              <span>{t("language")}</span>
              <ChevronDown className="w-4 h-4" />
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
      <div className="flex justify-center space-x-6 mt-8">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Facebook</span>
          <Facebook className="w-6 h-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Instagram</span>
          <Instagram className="w-6 h-6" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500 transition-colors"
        >
          <span className="sr-only">Twitter</span>
          <Twitter className="w-6 h-6" />
        </a>
      </div>

      {/* Copyright */}
      <p className="mt-8 text-muted-foreground text-base text-center">© {new Date().getFullYear()} WinWaterfall.</p>
    </footer>
  );
}

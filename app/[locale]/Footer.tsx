"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("navbar");

  return (
    <footer className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
      {/* Navigation */}
      <nav
        className="-mx-5 -my-2 flex flex-wrap justify-center"
        aria-label="Footer"
      >
        <div className="px-5 py-2">
          <Link
            href="/#features"
            className="text-base text-muted-foreground hover:text-primary-500"
          >
            {t("features")}
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link
            href="/#niches"
            className="text-base text-muted-foreground hover:text-primary-500"
          >
            {t("niches")}
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link
            href="/pricing"
            className="text-base text-muted-foreground hover:text-primary-500"
          >
            {t("pricing")}
          </Link>
        </div>
      </nav>

      {/* Socials */}
      <div className="mt-8 flex justify-center space-x-6">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500"
        >
          <span className="sr-only">Facebook</span>
          <Facebook className="h-6 w-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500"
        >
          <span className="sr-only">Instagram</span>
          <Instagram className="h-6 w-6" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary-500"
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

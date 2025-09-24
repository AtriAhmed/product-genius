"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";
import UserDropdown from "@/components/UserDropdown";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { LogOut, Menu, User, Zap } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const t = useTranslations("navbar");
  const isMounted = useIsMounted();

  const isAuthenticated = status === "authenticated";

  async function handleLogout() {
    await signOut({ redirect: false });
  }

  return (
    <nav className="fixed left-0 right-0 bg-background dark:bg-muted-background shadow-sm top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[55px]">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Zap className="text-primary-500 h-8 w-8" />
              <span className="ml-2 text-xl font-bold">ProductGenius</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/#features"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              {t("features")}
            </Link>
            <Link
              href="/#niches"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              {t("niches")}
            </Link>
            <Link
              href="/pricing"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              {t("pricing")}
            </Link>
            <div className="flex items-center gap-2">
              {/* Auth */}
              {!isAuthenticated ? (
                <Link
                  href="/auth/login"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t("login")}
                </Link>
              ) : (
                <>
                  <Link
                    href={
                      isMounted && ["ADMIN", "OWNER"].includes(user?.role || "")
                        ? "/admin"
                        : "/dashboard"
                    }
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {t("dashboard")}
                  </Link>

                  {/* Avatar Dropdown */}
                  <UserDropdown />
                </>
              )}
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/#features"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            {t("features")}
          </Link>
          <Link
            href="/#niches"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            {t("niches")}
          </Link>
          <Link
            href="/pricing"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            {t("pricing")}
          </Link>

          {!isAuthenticated ? (
            <Link
              href="/auth/login"
              className="block bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium"
            >
              {t("login")}
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="block bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium"
              >
                {t("dashboard")}
              </Link>

              {/* Avatar in mobile → simpler (just links) */}
              <div className="mt-2 space-y-1 border-t pt-2">
                <Link
                  href="/profile"
                  className="flex items-center text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
                >
                  <User className="mr-2 h-5 w-5" />
                  {t("profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t("logout")}
                </button>
                {/* Theme Switcher in mobile */}
                <ThemeSwitcher />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

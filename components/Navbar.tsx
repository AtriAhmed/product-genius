"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";
import UserDropdown from "@/components/UserDropdown";
import NotificationsSheet from "@/app/[locale]/NotificationsSheet";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { Link, usePathname } from "@/i18n/navigation";
import { isAuthorized } from "@/lib/authUtils";
import { LogOut, Menu, User, Zap } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Logo from "@/public/logo.svg";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const t = useTranslations("navbar");
  const isMounted = useIsMounted();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  async function handleLogout() {
    await signOut({ redirect: false });
  }

  const isDashboard = pathname.startsWith(`/dashboard`) || pathname.startsWith(`/admin`);

  return (
    <nav className="top-0 right-0 left-0 z-50 fixed dark:border-b bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[55px]">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo className="w-8 h-8" />
              <span className="ml-2 font-bold text-xl">WinWaterfall</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!isDashboard && (
              <>
                <Link href="/#features" className="px-1 py-2 font-medium hover:text-primary-500 text-xs lg:text-sm">
                  {t("features")}
                </Link>
                <Link href="/#niches" className="px-1 py-2 font-medium hover:text-primary-500 text-xs lg:text-sm">
                  {t("niches")}
                </Link>
                <Link href="/pricing" className="px-1 py-2 font-medium hover:text-primary-500 text-xs lg:text-sm">
                  {t("pricing")}
                </Link>
              </>
            )}
            <div className="flex items-center gap-2">
              {/* Auth */}
              {!isAuthenticated ? (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-md bg-primary-500 hover:bg-primary-600 font-medium text-white text-xs lg:text-sm"
                >
                  {t("login")}
                </Link>
              ) : (
                <>
                  <Link
                    href={isMounted && isAuthorized(user, ["USER"]) ? "/dashboard" : "/admin"}
                    className="px-4 py-2 rounded-md bg-primary-500 hover:bg-primary-600 font-medium text-white text-xs lg:text-sm"
                  >
                    {t("dashboard")}
                  </Link>

                  {/* Notifications */}
                  <NotificationsSheet />

                  {/* Avatar Dropdown */}
                  <UserDropdown />
                </>
              )}
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex justify-center items-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset hover:bg-gray-100 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden space-y-1 px-2 pt-2 pb-3">
          <Link
            href="/#features"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-500 text-base"
          >
            {t("features")}
          </Link>
          <Link
            href="/#niches"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-500 text-base"
          >
            {t("niches")}
          </Link>
          <Link
            href="/pricing"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-500 text-base"
          >
            {t("pricing")}
          </Link>

          {!isAuthenticated ? (
            <Link
              href="/auth/login"
              className="block px-3 py-2 rounded-md bg-primary-500 hover:bg-primary-600 font-medium text-white text-base"
            >
              {t("login")}
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md bg-primary-500 hover:bg-primary-600 font-medium text-white text-base"
              >
                {t("dashboard")}
              </Link>

              {/* Avatar in mobile → simpler (just links) */}
              <div className="space-y-1 mt-2 pt-2 border-t">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-500 text-base"
                >
                  <User className="w-5 h-5 mr-2" />
                  {t("profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-500 text-base text-left"
                >
                  <LogOut className="w-5 h-5 mr-2" />
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

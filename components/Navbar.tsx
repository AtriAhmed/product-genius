"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Zap } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 dark:bg-muted-background shadow-sm top-0 z-50">
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
              Features
            </Link>
            <Link
              href="/#niches"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              Niches
            </Link>
            <Link
              href="/pricing"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="hover:text-primary-500 px-3 py-2 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
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
            Features
          </Link>
          <Link
            href="/#niches"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            Niches
          </Link>
          <Link
            href="/pricing"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="block text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="block bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium"
          >
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}

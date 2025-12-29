import "@/app/[locale]/globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/contexts/Providers";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { NextIntlClientProvider } from "next-intl";
import { Exo_2, Geist, Geist_Mono, Roboto } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "WinWaterfall - Find Winning Products For Your Store",
  description:
    "Discover trending products and boost your e-commerce store's sales with WinWaterfall. Find winning products tailored for your niche today!",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "WinWaterfall - Find Winning Products For Your Store",
    description:
      "Discover trending products and boost your e-commerce store's sales with WinWaterfall. Find winning products tailored for your niche today!",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "WinWaterfall",
    images: "/opengraph-image.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${exo2.variable} antialiased font-exo2`}
      >
        <NextIntlClientProvider>
          <Providers session={session}>
            <Toaster />
            <Navbar />
            <div className="mt-[55px]">{children}</div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

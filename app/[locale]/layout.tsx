import "@/app/[locale]/globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/contexts/Providers";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Products Genius",
  description: "Find Winning Products For Your Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

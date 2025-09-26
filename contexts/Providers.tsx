"use client";

import AppProvider from "@/contexts/AppProvider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbProvider";

type ProvidersProps = {
  children: ReactNode;
  session: Session | null;
};

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <AppProvider>
        <BreadcrumbProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </BreadcrumbProvider>
      </AppProvider>
    </SessionProvider>
  );
}

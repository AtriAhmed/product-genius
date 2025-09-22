"use client";

import { MainLoader } from "@/components/Loaders";
import { Role } from "@/types";
import { useSession } from "next-auth/react";
import { notFound, useRouter } from "next/navigation";
import { useEffect } from "react";

type PrivateProps = {
  children: React.ReactNode;
  /** Roles that are allowed to access this page */
  allowedRoles?: Role[];
  /** If true, only unauthenticated users are allowed */
  guestOnly?: boolean;
  /** Where to redirect if unauthorized */
  redirectTo?: string;
};

export default function Private({
  children,
  allowedRoles,
  guestOnly = false,
  redirectTo = "/",
}: Readonly<PrivateProps>) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Loading state → don’t redirect yet
    if (status === "loading") return;

    // Guest-only pages
    if (guestOnly) {
      if (session) {
        router.push(redirectTo);
      }
      return;
    }

    // Auth required
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Role check
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = session.user?.role; // make sure you have role in your JWT/session
      if (!userRole || !allowedRoles.includes(userRole)) {
        // router.push(redirectTo);
        return notFound();
      }
    }
  }, [session, status, guestOnly, allowedRoles, redirectTo, router]);

  // Show loader while checking
  if (status === "loading") {
    return (
      <div className="flex h-[calc(100vh-55px)] w-full items-center justify-center">
        <MainLoader />
      </div>
    );
  }

  // Guest-only: show children if no session
  if (guestOnly && !session) {
    return children;
  }

  // Authenticated with valid role
  if (session) {
    if (
      !allowedRoles ||
      allowedRoles.length === 0 ||
      allowedRoles.includes(session.user?.role)
    ) {
      return children;
    }
  }

  // Otherwise → nothing (will redirect)
  return null;
}

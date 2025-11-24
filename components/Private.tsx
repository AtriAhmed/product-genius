"use client";

import { MainLoader } from "@/components/Loaders";
import { usePathname } from "@/i18n/navigation";
import { Role, User } from "@/types";
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
  getRedirectTo?: (user?: Partial<User>) => Promise<string>;
};

export default function Private({
  children,
  allowedRoles,
  guestOnly = false,
  getRedirectTo = () => Promise.resolve("/auth/login"),
}: Readonly<PrivateProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Loading state → don’t redirect yet
    if (status === "loading") return;

    // Guest-only pages
    if (guestOnly) {
      if (session) {
        getRedirectTo((session?.user as any) || {}).then((redirectTo) => {
          router.push(redirectTo);
        });
      }
      return;
    }

    // Auth required
    if (!session) {
      getRedirectTo().then((redirectTo) => {
        router.push(redirectTo);
      });
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
  }, [session, status, guestOnly, allowedRoles, router]);

  // Show loader while checking
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-55px)]">
        <MainLoader />
      </div>
    );
  }

  // Guest-only: show children if no session
  if (guestOnly && !session) {
    return children;
  }

  console.log("-------------------- pathname --------------------");
  console.log(pathname);
  if (
    session?.user?.role === "EDITOR" &&
    !pathname.includes("/products") &&
    !pathname.includes("/categories") &&
    !pathname.includes("/shipping-zones") &&
    !pathname.includes("/auth") &&
    pathname !== "/admin"
  ) {
    return notFound();
  }

  // Authenticated with valid role
  if (session) {
    if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(session.user?.role)) {
      return children;
    }
  }

  // Otherwise → nothing (will redirect)
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[calc(100vh-55px)]">
      <MainLoader />
    </div>
  );
}

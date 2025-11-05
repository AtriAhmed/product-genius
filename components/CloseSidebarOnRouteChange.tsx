"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar"; // <-- this hook exists in the shadcn sidebar

export function CloseSidebarOnRouteChange() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    // Close sidebar anytime route changes
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}

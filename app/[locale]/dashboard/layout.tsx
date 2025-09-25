import "@/app/[locale]/globals.css";
import Private from "@/components/Private";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { UserSidebar } from "@/components/dashboard/Sidebar";
import { DashboardBreadcrumb } from "@/components/dashboard/Breadcumb.tsx";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !["USER"].includes(session.user?.role)) {
    notFound();
  }

  return (
    <Private allowedRoles={["USER"]}>
      <SidebarProvider className="min-h-[calc(100vh-55px)]">
        <UserSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DashboardBreadcrumb />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Private>
  );
}

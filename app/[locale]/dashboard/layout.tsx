import "@/app/[locale]/globals.css";
import { DashboardBreadcrumb } from "@/components/Breadcrumb";
import { CloseSidebarOnRouteChange } from "@/components/CloseSidebarOnRouteChange";
import { UserSidebar } from "@/components/dashboard/Sidebar";
import Private from "@/components/Private";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await isAuthenticatedServerSide(["USER"], true);

  if (!user) {
    notFound();
  }

  return (
    <Private allowedRoles={["USER"]}>
      <SidebarProvider className="min-h-[calc(100vh-var(--navbar-height))]">
        <CloseSidebarOnRouteChange />
        <UserSidebar />
        <SidebarInset>
          <header className="top-navbar right-0 left-0 z-20 md:static fixed flex items-center gap-2 h-11 md:h-16 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ml-1 bg-background transition-[width,height] ease-linear shrink-0">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <DashboardBreadcrumb />
            </div>
          </header>
          {/* fill the space when the screen is small and there the breadcrumbs are fixed */}
          <div className="md:hidden h-11"></div>
          <div className="flex flex-col flex-1 gap-4 px-1 sm:px-4 py-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Private>
  );
}

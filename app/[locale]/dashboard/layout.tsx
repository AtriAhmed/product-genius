import "@/app/[locale]/globals.css";
import Private from "@/components/Private";
import { DashboardBreadcrumb } from "@/components/Breadcrumb";
import { UserSidebar } from "@/components/dashboard/Sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import DashboardContent from "@/app/[locale]/dashboard/DashboardContent";
import { CloseSidebarOnRouteChange } from "@/components/CloseSidebarOnRouteChange";

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
      <SidebarProvider className="min-h-[calc(100vh-55px)]">
        <CloseSidebarOnRouteChange />
        <UserSidebar />
        <SidebarInset>
          <header className="flex items-center gap-2 h-16 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <DashboardBreadcrumb />
            </div>
          </header>
          <div className="flex flex-col flex-1 gap-4 px-2 sm:px-4 py-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Private>
  );
}

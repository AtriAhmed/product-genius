import "@/app/[locale]/globals.css";
import { DashboardBreadcrumb } from "@/components/Breadcrumb";
import { CloseSidebarOnRouteChange } from "@/components/CloseSidebarOnRouteChange";
import Private from "@/components/Private";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = isAuthenticatedServerSide(["OWNER", "ADMIN", "EDITOR"], false);

  if (!user) {
    notFound();
  }

  return (
    <Private allowedRoles={["OWNER", "ADMIN", "EDITOR"]}>
      <SidebarProvider className="min-h-[calc(100vh-55px)]">
        <CloseSidebarOnRouteChange />
        <AdminSidebar />
        <SidebarInset>
          <header className="flex items-center gap-2 h-16 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <DashboardBreadcrumb />
            </div>
          </header>
          <div className="flex flex-col flex-1 gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Private>
  );
}

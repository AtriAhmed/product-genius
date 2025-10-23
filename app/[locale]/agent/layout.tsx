import "@/app/[locale]/globals.css";
import { DashboardBreadcrumb } from "@/components/Breadcrumb";
import Private from "@/components/Private";
import { AgentSidebar } from "@/components/agent/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !["AGENT"].includes(session.user?.role)) {
    notFound();
  }

  return (
    <Private allowedRoles={["AGENT"]}>
      <SidebarProvider className="min-h-[calc(100vh-55px)]">
        <AgentSidebar />
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

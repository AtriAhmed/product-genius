import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppProvider } from "@/contexts/AppProvider";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SidebarCurrentSubscription() {
  const { currentPlan } = useAppProvider();
  const t = useTranslations("sidebar");

  if (!currentPlan) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex-1 grid text-sm text-left leading-tight">
                <Skeleton className="w-24 h-4 mb-1" />
                <Skeleton className="w-16 h-3" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  const isFree = currentPlan?.isFree;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <div className="flex items-center gap-3 p-2 border rounded-lg bg-gradient-to-br from-background to-muted/30 hover:to-muted/50 hover:shadow-sm transition-all duration-200">
              <div className="relative">
                <div
                  className={cn(
                    "flex justify-center items-center size-8 rounded-lg transition-all duration-200",
                    isFree
                      ? "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-sm"
                      : "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 dark:from-yellow-600 dark:via-amber-500 dark:to-yellow-700 shadow-md shadow-amber-500/20"
                  )}
                >
                  <Star
                    className={cn(
                      "size-4 transition-all duration-200",
                      isFree ? "text-slate-600 dark:text-slate-400" : "text-white fill-white/90"
                    )}
                  />
                </div>
                {!isFree && (
                  <div className="-top-1 -right-1 absolute size-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 animate-pulse" />
                )}
              </div>
              <div className="flex-1 grid min-w-0 text-sm text-left leading-tight">
                <span className="flex items-center gap-1.5 font-semibold truncate">
                  {currentPlan.name}
                  {!isFree && <Sparkles className="flex-shrink-0 size-3 text-amber-500 dark:text-yellow-500" />}
                </span>
                <span className="text-muted-foreground text-xs truncate">{t("current plan")}</span>
              </div>
              {isFree && (
                <Button
                  size="sm"
                  className="h-6 px-2.5 !py-0 shadow-sm hover:shadow font-semibold text-[10px] transition-all duration-200"
                  variant="primary"
                  asChild
                >
                  <Link href="/dashboard/billing">Upgrade</Link>
                </Button>
              )}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

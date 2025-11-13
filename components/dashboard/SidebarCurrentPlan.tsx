import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppProvider } from "@/contexts/AppProvider";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SidebarCurrentPlan() {
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
            <div className="flex border">
              <div
                className={cn(
                  "flex justify-center items-center size-8 aspect-square rounded-lg bg-muted-background",
                  !isFree &&
                    "bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"
                )}
              >
                <Star className={cn("size-4", !isFree && "text-white")} />
              </div>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-semibold truncate">{currentPlan.name}</span>
                <span className="text-slate-foreground text-xs truncate">{t("current plan")}</span>
              </div>
              {isFree && (
                <Button size="sm" className="h-6 !py-0 font-bold text-[10px]" variant="primary" asChild>
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

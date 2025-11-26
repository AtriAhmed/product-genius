"use client";

import {
  BadgeCheck,
  BarChart3,
  Bell,
  ChevronsUpDown,
  CreditCard,
  FileQuestionMark,
  FolderTree,
  Globe,
  Languages,
  LogOut,
  NotepadText,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { Role } from "@/types";
import Logo from "@/public/logo.svg";

// Navigation item type
type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

// Admin navigation data
const navigationData: NavigationItem[] = [
  {
    title: "overview",
    url: "/admin",
    icon: BarChart3,
    roles: ["OWNER", "ADMIN", "EDITOR", "AGENT"],
  },
  {
    title: "products",
    url: "/admin/products",
    icon: Package,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  },
  {
    title: "categories",
    url: "/admin/categories",
    icon: FolderTree,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  },
  {
    title: "shipping zones",
    url: "/admin/shipping-zones",
    icon: Truck,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  },
  {
    title: "faqs",
    url: "/admin/faqs",
    icon: FileQuestionMark,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  },
  {
    title: "orders",
    url: "/admin/orders",
    icon: NotepadText,
    roles: ["OWNER", "ADMIN", "AGENT"],
  },
  {
    title: "users",
    url: "/admin/users",
    icon: Users,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "subscriptions",
    url: "/admin/subscriptions",
    icon: CreditCard,
    // roles: ["OWNER", "ADMIN"],
    roles: [],
  },
  {
    title: "plans",
    url: "/admin/plans",
    icon: Star,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "analytics",
    url: "/admin/analytics",
    icon: BarChart3,
    roles: [],
  },
  {
    title: "settings",
    url: "/admin/settings",
    icon: Settings,
    roles: [],
  },
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("sidebar");

  // Function to check if user has permission to see a navigation item
  const hasPermission = (item: NavigationItem): boolean => {
    const userRole = session?.user?.role;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  // Filter navigation items based on user role
  const allowedNavigation = navigationData.filter(hasPermission);

  async function handleLogout() {
    await signOut({ redirect: false });
  }

  return (
    <Sidebar
      className="top-[55px] h-[calc(100vh-55px)] light:border-none shadow-[0_0_3px_rgb(0,0,0,.2)]"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="no-ring">
                <div className="flex justify-center items-center size-8 aspect-square rounded-lg bg-primary-500 text-sidebar-primary-foreground">
                  <Logo className="w-5 h-5 fill-white" />
                </div>
                <div className="flex-1 grid text-sm text-left leading-tight">
                  <span className="font-semibold truncate">{t("winwaterfall")}</span>
                  <span className="text-muted-foreground text-xs truncate">{t("admin panel")}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("admin panel")}</SidebarGroupLabel>
          <SidebarMenu>
            {allowedNavigation.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url} className="no-ring">
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="w-8 h-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.slice(0, 2)?.toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid text-sm text-left leading-tight">
                    <span className="font-semibold truncate">{session?.user?.name || t("admin")}</span>
                    <span className="text-muted-foreground text-xs truncate">{session?.user?.email}</span>
                  </div>
                  <ChevronsUpDown className="size-4 ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  {/* User info header */}
                  <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
                    <Avatar className="w-8 h-8 rounded-lg">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid text-sm text-left leading-tight">
                      <span className="font-semibold truncate">{session?.user?.name || t("admin")}</span>
                      <span className="text-muted-foreground text-xs truncate">{session?.user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="no-ring">
                      <Sparkles />
                      {t("admin profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="no-ring">
                      <Settings />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/notifications" className="no-ring">
                      <Bell />
                      {t("notifications")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <Languages className="size-4 text-muted-foreground" />
                    {t("language")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        router.replace(pathname, {
                          locale: "en",
                          scroll: false,
                        });
                      }}
                    >
                      {t("english")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        router.replace(pathname, {
                          locale: "fr",
                          scroll: false,
                        });
                      }}
                    >
                      {t("french")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="no-ring">
                    <BadgeCheck />
                    {t("back to site")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  {t("log out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

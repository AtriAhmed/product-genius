"use client";

import {
  BadgeCheck,
  BarChart3,
  Bell,
  ChevronsUpDown,
  CreditCard,
  FileText,
  Languages,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import ShopifyIcon from "@/assets/images/shopify-outline.svg";
import Image from "next/image";

// User navigation data
const navigationData = [
  {
    title: "overview",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "orders",
    url: "/dashboard/orders",
    icon: ShoppingCart,
    subItems: [
      {
        title: "orders",
        url: "/dashboard/orders",
        icon: Truck,
      },
      {
        title: "cart",
        url: "/dashboard/orders/cart",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "billing",
    url: "/dashboard/billing",
    icon: CreditCard,
    subItems: [
      {
        title: "billing details",
        url: "/dashboard/billing",
        // suitable icon
        icon: CreditCard,
      },
      {
        title: "invoices",
        url: "/dashboard/invoices",
        icon: FileText,
      },
    ],
  },
  {
    title: "shopify account",
    url: "/dashboard/shopify",
    icon: () => <ShopifyIcon height={15} alt="Shopify Icon" />,
  },
  // {
  //   title: "settings",
  //   url: "/dashboard/settings",
  //   icon: Settings,
  // },
];

export function UserSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("sidebar");

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
              <Link href="/" className="no-ring">
                <div className="flex justify-center items-center size-8 aspect-square rounded-lg bg-primary-500 text-sidebar-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="flex-1 grid text-sm text-left leading-tight">
                  <span className="font-semibold truncate">
                    {t("product genius")}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    {t("user panel")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("user panel")}</SidebarGroupLabel>
          <SidebarMenu>
            {navigationData.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.subItems ? (
                  <>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        item.subItems.some(
                          (subItem) => pathname === subItem.url
                        )
                      }
                    >
                      <Link href={item.url} className="no-ring">
                        <item.icon />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url} className="no-ring">
                              <subItem.icon />
                              <span>{t(subItem.title)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </>
                ) : (
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="no-ring">
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
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
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.slice(0, 2)?.toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid text-sm text-left leading-tight">
                    <span className="font-semibold truncate">
                      {session?.user?.name || t("user")}
                    </span>
                    <span className="text-muted-foreground text-xs truncate">
                      {session?.user?.email}
                    </span>
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
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                          "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid text-sm text-left leading-tight">
                      <span className="font-semibold truncate">
                        {session?.user?.name || t("user")}
                      </span>
                      <span className="text-muted-foreground text-xs truncate">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="no-ring">
                      <Sparkles />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="no-ring">
                      <Settings />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/notifications" className="no-ring">
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

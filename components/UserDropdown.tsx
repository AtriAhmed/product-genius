"use client";

import avatar from "@/assets/images/avatar.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function UserDropdown() {
  const t = useTranslations("navbar");

  async function handleLogout() {
    await signOut({ redirect: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Image
            src={avatar} // replace with real avatar if available
            alt="Avatar"
            width={36}
            height={36}
            className="rounded-full border shadow-sm"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center no-ring">
            <User className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

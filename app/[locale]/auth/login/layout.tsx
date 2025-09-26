import "@/app/[locale]/globals.css";
import Private from "@/components/Private";
import { authOptions } from "@/lib/auth";
import { User } from "@/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <Private
      guestOnly
      getRedirectTo={async (user) => {
        "use server";
        return user?.role === "USER" ? "/dashboard" : "/admin";
      }}
    >
      {children}
    </Private>
  );
}

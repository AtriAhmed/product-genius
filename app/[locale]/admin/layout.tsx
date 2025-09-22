import "@/app/[locale]/globals.css";
import Private from "@/components/Private";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !["OWNER", "ADMIN"].includes(session.user?.role)) {
    notFound();
  }

  return <Private allowedRoles={["OWNER", "ADMIN"]}>{children}</Private>;
}

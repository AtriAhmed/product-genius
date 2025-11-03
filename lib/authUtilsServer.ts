import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, User as UserType } from "@/types";
import { getServerSession, Session, User } from "next-auth";

export async function isAuthenticatedServerSide(
  roles: Role[],
  returnDatabaseUser: true,
  sessionOverride?: Session | null
): Promise<UserType | null>;

export async function isAuthenticatedServerSide(
  roles: Role[],
  returnDatabaseUser: false,
  sessionOverride?: Session | null
): Promise<User | null>;

export async function isAuthenticatedServerSide(
  roles: Role[] = [],
  returnDatabaseUser = false,
  sessionOverride?: Session | null
) {
  try {
    const session = sessionOverride || (await getServerSession(authOptions));
    if (!session?.user) return null;

    let user: User | UserType = session.user as User;

    if (returnDatabaseUser) {
      user = (await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        include: { currentSubscription: true, shopifyStores: true },
      })) as UserType;

      if (!user) return null;
    }

    if (roles.length === 0) return user;

    const userRole = session.user.role as Role;
    if (roles.includes(userRole)) return user;

    return null;
  } catch (error) {
    console.error("isAuthenticatedServerSide error:", error);
    return null;
  }
}

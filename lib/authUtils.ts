import { Role } from "@/types";

export function isAuthorized(user: Record<string, any> & { role?: Role }, roles: Role[]) {
  if (!user?.role) return false;

  return roles.includes(user?.role);
}

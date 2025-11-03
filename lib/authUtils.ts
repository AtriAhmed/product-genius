import { Role } from "@/types";

export function isAuthorized(user: any & { role: Role }, roles: Role[]) {
  return roles.includes(user?.role);
}

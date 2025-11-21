import { Role, User } from "@/types";

export function isAuthorized(user: Partial<User> & { role: Role }, roles: Role[]) {
  return roles.includes(user?.role);
}

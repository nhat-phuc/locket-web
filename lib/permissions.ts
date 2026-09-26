import type { UserRole } from "@/types/user";

export const PERMISSIONS: Record<UserRole, readonly string[]> = {
  user: [
    "user:read:self",
    "user:update:self",
    "order:create",
    "order:read:self",
    "transaction:read:self",
    "review:create",
  ],
  moderator: [
    "user:read:self",
    "user:update:self",
    "user:read:all",
    "order:create",
    "order:read:self",
    "order:read:all",
    "order:update",
    "transaction:read:self",
    "transaction:read:all",
    "review:create",
    "review:moderate",
    "post:create",
    "post:update",
  ],
  admin: ["*"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function requirePermission(role: UserRole, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function isAdminRole(role: string): boolean {
  return role === "admin";
}

export function isModeratorRole(role: string): boolean {
  return role === "admin" || role === "moderator";
}

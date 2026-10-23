// Role-based access control for the admin console. Pure data — safe to import
// from client and server code. Every page and server action checks these on
// the server; hiding a menu item is never the only protection.

export const roles = {
  SUPER_ADMIN: { label: "Super Admin", description: "Full access, including creating and managing users" },
  ADMIN: { label: "Admin", description: "Leads, quotes, rate card, website content and integrations" },
  MANAGER: { label: "Manager", description: "Work leads and prepare / send quotes" },
} as const;
export type Role = keyof typeof roles;

export const permissions = {
  "leads.view": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "leads.edit": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "leads.export": ["SUPER_ADMIN", "ADMIN"],
  "quotes.manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "rates.edit": ["SUPER_ADMIN", "ADMIN"],
  "content.edit": ["SUPER_ADMIN", "ADMIN"],
  "settings.manage": ["SUPER_ADMIN", "ADMIN"],
  "drivers.view": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "drivers.manage": ["SUPER_ADMIN", "ADMIN"],
  "users.manage": ["SUPER_ADMIN"],
  // Website photos (hero, destinations, packages) — Super Admin only
  "media.manage": ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof permissions;

export function can(role: string | null | undefined, permission: Permission) {
  return !!role && (permissions[permission] as readonly string[]).includes(role);
}

export function isRole(value: string): value is Role {
  return value in roles;
}

export function roleLabel(role: string) {
  return isRole(role) ? roles[role].label : role;
}

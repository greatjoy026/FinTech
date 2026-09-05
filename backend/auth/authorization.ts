export const ROLES = ['ADMIN', 'CUSTOMER', 'MERCHANT', 'SCHOOL', 'AGENT', 'DRIVER', 'NGO', 'EVENT_ORGANIZER'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  READ_OWN: 'read:own',
  READ_REPORTS: 'reports:read',
  ADMIN_OPERATIONS: 'admin:operations',
  PRIVILEGED_OPERATIONS: 'admin:privileged',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  ADMIN: [PERMISSIONS.READ_OWN, PERMISSIONS.READ_REPORTS, PERMISSIONS.ADMIN_OPERATIONS, PERMISSIONS.PRIVILEGED_OPERATIONS],
  CUSTOMER: [PERMISSIONS.READ_OWN],
  MERCHANT: [PERMISSIONS.READ_OWN],
  SCHOOL: [PERMISSIONS.READ_OWN],
  AGENT: [PERMISSIONS.READ_OWN],
  DRIVER: [PERMISSIONS.READ_OWN],
  NGO: [PERMISSIONS.READ_OWN],
  EVENT_ORGANIZER: [PERMISSIONS.READ_OWN],
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function hasPermission(role: unknown, permission: Permission): boolean {
  return isRole(role) && ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessUserResource(actorUserId: string, resourceUserId: string): boolean {
  return Boolean(actorUserId) && Boolean(resourceUserId) && actorUserId === resourceUserId;
}

export function canAccessAdminOperations(role: unknown): boolean {
  return hasPermission(role, PERMISSIONS.ADMIN_OPERATIONS);
}

export function canAccessPrivilegedOperations(role: unknown): boolean {
  return hasPermission(role, PERMISSIONS.PRIVILEGED_OPERATIONS);
}

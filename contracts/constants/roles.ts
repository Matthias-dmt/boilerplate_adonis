export const ROLES = ['super_admin', 'admin', 'customer'] as const
export type UserRole = (typeof ROLES)[number]

export const ROLE_ORDER: Record<UserRole, number> = {
  super_admin: 3,
  admin: 2,
  customer: 1,
}

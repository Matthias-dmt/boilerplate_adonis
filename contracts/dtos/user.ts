import type { UserRole } from '#contracts/constants/roles'
import { toIso } from '#utils/date'

export type UserDTO = {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  role: UserRole
}

export const toUserDTO = (u: any): UserDTO => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  isActive: !!u.isActive,
  lastLoginAt: toIso(u.lastLoginAt),
  createdAt: toIso(u.createdAt)!,
  updatedAt: toIso(u.updatedAt)!,
  role: u.role,
})

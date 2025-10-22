export type UserDTO = {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const toUserDTO = (u: any): UserDTO => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  isActive: u.isActive,
  createdAt: u.createdAt.toISO?.() ?? String(u.createdAt),
  updatedAt: u.updatedAt.toISO?.() ?? String(u.updatedAt),
})

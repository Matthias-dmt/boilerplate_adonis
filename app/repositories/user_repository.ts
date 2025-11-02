import type { UserRole } from '#contracts/constants/roles'
import User from '#models/user'
import type { Sort } from '#utils/query'
import { DateTime } from 'luxon'
export class UserRepository {
  async paginate(params: { page: number; perPage: number; search?: string; sorts: Sort[] }) {
    const q = User.query().whereNull('deleted_at')

    if (params.search) {
      const s = `%${params.search.toLowerCase()}%`
      q.where((w) =>
        w
          .whereRaw('LOWER(email) LIKE ?', [s])
          .orWhereRaw('LOWER(first_name) LIKE ?', [s])
          .orWhereRaw('LOWER(last_name) LIKE ?', [s])
      )
    }

    for (const s of params.sorts) q.orderBy(s.field as any, s.direction)
    return q.paginate(params.page, params.perPage)
  }

  findById(id: string) {
    return User.query().where('id', id).whereNull('deleted_at').first()
  }

  findByEmail(email: string) {
    return User.query().where('email', email.trim().toLowerCase()).first()
  }

  async create(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    isActive?: boolean
    role?: UserRole
  }) {
    return User.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive ?? true,
      role: data.role ?? 'customer',
    })
  }

  async update(
    entity: User,
    data: Partial<{
      email: string
      password: string
      firstName: string
      lastName: string
      isActive: boolean
      role?: UserRole
    }>
  ) {
    entity.merge({ ...data })
    await entity.save()
    return entity
  }

  async softDelete(entity: User) {
    entity.deletedAt = DateTime.now()
    await entity.save()
  }

  async restore(id: string) {
    const u = await User.find(id)
    if (!u) return null
    u.deletedAt = null
    await u.save()
    return u
  }
}

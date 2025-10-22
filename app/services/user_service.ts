// app/Services/UserService.ts
import { toUserDTO, type UserDTO } from '#contracts/dtos/user'
import { Conflict, NotFound } from '#exceptions/http_error_exception'
import { UserRepository } from '#repositories/user_repository'

export class UserService {
  constructor(private readonly repo = new UserRepository()) {}

  async list(params: {
    page: number
    perPage: number
    search?: string
    sorts?: { field: string; direction: 'asc' | 'desc' }[]
  }) {
    const page = await this.repo.paginate(params)
    return {
      data: page.all().map(toUserDTO),
      meta: {
        total: page.total,
        perPage: page.perPage,
        currentPage: page.currentPage,
        lastPage: page.lastPage,
      },
    }
  }

  async get(id: string): Promise<UserDTO> {
    const u = await this.repo.findById(id)
    if (!u) throw NotFound('USER_NOT_FOUND', 'User not found')
    return toUserDTO(u)
  }

  async create(payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    isActive?: boolean
  }): Promise<UserDTO> {
    const existing = await this.repo.findByEmail(payload.email)
    if (existing) throw Conflict('EMAIL_TAKEN', 'Email already in use')
    const u = await this.repo.create(payload)
    return toUserDTO(u)
  }

  async update(
    id: string,
    payload: Partial<{
      email: string
      password: string
      firstName: string
      lastName: string
      isActive: boolean
    }>
  ): Promise<UserDTO> {
    const u = await this.repo.findById(id)
    if (!u) throw NotFound('USER_NOT_FOUND', 'User not found')
    if (payload.email) {
      const other = await this.repo.findByEmail(payload.email)
      if (other && other.id !== id) throw Conflict('EMAIL_TAKEN', 'Email already in use')
    }
    const updated = await this.repo.update(u, payload)
    return toUserDTO(updated)
  }

  async remove(id: string) {
    const u = await this.repo.findById(id)
    if (!u) return
    await this.repo.softDelete(u)
  }

  async restore(id: string): Promise<UserDTO> {
    const u = await this.repo.restore(id)
    if (!u) throw NotFound('USER_NOT_FOUND', 'User not found')
    return toUserDTO(u)
  }
}

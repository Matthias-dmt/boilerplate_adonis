import { ROLE_ORDER, type UserRole } from '#contracts/constants/roles'
import { errors as authErrors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  public async handle(ctx: HttpContext, next: NextFn, allowedRoles: UserRole[]) {
    if (!ctx.auth.user) {
      throw new authErrors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'api',
      })
    }

    if (!allowedRoles || allowedRoles.length === 0) {
      throw new Error('[RoleMiddleware] No allowed roles provided')
    }

    const userRole = ctx.auth.user.role as UserRole | undefined
    if (!userRole) {
      return ctx.response.forbidden({
        error: { code: 'FORBIDDEN', message: 'Missing role' },
      })
    }

    const minRequired = Math.max(...allowedRoles.map((r) => ROLE_ORDER[r]))
    const actual = ROLE_ORDER[userRole] ?? 0

    if (actual < minRequired) {
      return ctx.response.forbidden({
        error: { code: 'FORBIDDEN', message: 'Insufficient role' },
      })
    }

    await next()
  }
}

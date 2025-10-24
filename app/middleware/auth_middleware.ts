// app/middleware/auth_middleware.ts
import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  // only used by session guard to know where to redirect if browser, ignore for API
  protected redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    /**
     * This is the magic:
     * - it authenticates using the guards you pass (or default guard if none)
     * - if auth fails -> it throws E_UNAUTHORIZED_ACCESS
     *   -> which becomes a 401 JSON error in API context
     * - if success -> ctx.auth.user is set
     */
    await ctx.auth.authenticateUsing(options.guards, {
      loginRoute: this.redirectTo,
    })

    return next()
  }
}

// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'
// import type { Authenticators } from '@adonisjs/auth/types'

// /**
//  * Auth middleware is used authenticate HTTP requests and deny
//  * access to unauthenticated users.
//  */
// export default class AuthMiddleware {
//   /**
//    * The URL to redirect to, when authentication fails
//    */
//   redirectTo = '/login'

//   async handle(
//     ctx: HttpContext,
//     next: NextFn,
//     options: {
//       guards?: (keyof Authenticators)[]
//     } = {}
//   ) {
//     await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
//     return next()
//   }
// }

import type { HttpContext } from '@adonisjs/core/http'

export default class AuthGuard {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const token = (ctx.request.header('authorization') ?? '').split(' ')[1]
    if (!token)
      return ctx.response.unauthorized({
        error: { code: 'UNAUTHENTICATED', message: 'Missing token' },
      })
    ;(ctx as any).auth = { userId: 'admin' }
    await next()
  }
}

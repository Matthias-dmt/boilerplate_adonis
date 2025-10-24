import AuthService from '#services/auth_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  private service = new AuthService()

  public async login(ctx: HttpContext) {
    const data = await this.service.login(ctx)
    return ctx.response.ok(data)
  }

  public async refresh(ctx: HttpContext) {
    return this.service.refresh(ctx)
  }

  public async me(ctx: HttpContext) {
    const data = await this.service.me(ctx)
    return ctx.response.ok(data)
  }

  public async logout(ctx: HttpContext) {
    await this.service.logout(ctx)
    return ctx.response.noContent()
  }
}

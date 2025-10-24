import InvalidCredentialsException from '#exceptions/invalid_credentials_exception'
import RefreshToken from '#models/refresh_token'
import User from '#models/user'
import { generatePlainRefreshToken, hashRefreshToken } from '#utils/refresh_token'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AuthService {
  /**
   * Login:
   * - verify email/password
   * - create access token (short-lived)
   * - create refresh token entry in DB (long-lived)
   * - return both plain access + plain refresh
   */
  public async login(ctx: HttpContext) {
    const { request, auth } = ctx
    const { email, password } = request.only(['email', 'password'])

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await User.findBy('email', normalizedEmail)
    if (!user) {
      throw new InvalidCredentialsException()
    }

    const ok = await User.verifyPassword(user.password, password)
    if (!ok) {
      throw new InvalidCredentialsException()
    }

    // create access token via guard "api"
    const accessToken = await auth.use('api').createToken(user)

    // create refresh token manually
    const plainRefresh = generatePlainRefreshToken()
    const hashed = hashRefreshToken(plainRefresh)

    const refreshRecord = new RefreshToken()
    refreshRecord.userId = user.id
    refreshRecord.hashedToken = hashed
    refreshRecord.expiresAt = DateTime.utc().plus({ days: 30 })
    refreshRecord.revokedAt = null
    await refreshRecord.save()

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      tokens: {
        access: {
          type: accessToken.type, // "bearer"
          value: accessToken.value!.release(), // "oat_xxx"
          abilities: accessToken.abilities ?? ['*'],
          expiresAt: accessToken.expiresAt ?? null,
        },
        refresh: {
          value: plainRefresh, // plain text refresh token for the client
          expiresAt: refreshRecord.expiresAt.toISO(),
        },
      },
    }
  }

  /**
   * Refresh:
   * - client sends refreshToken
   * - we locate it in DB by hash
   * - check not expired / not revoked
   * - rotate: revoke old refresh token, issue new ones
   * - return new access token + new refresh token
   */
  public async refresh(ctx: HttpContext) {
    const { request, auth, response } = ctx
    const incoming = request.input('refreshToken')

    if (!incoming || typeof incoming !== 'string') {
      return response.unauthorized({
        error: { code: 'MISSING_REFRESH_TOKEN', message: 'Missing refresh token' },
      })
    }

    const hashed = hashRefreshToken(incoming)

    const tokenRow = await RefreshToken.query().where('hashed_token', hashed).first()

    if (!tokenRow) {
      return response.unauthorized({
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' },
      })
    }

    // tokenRow exists → check still active
    const now = DateTime.utc()
    if (!tokenRow.isActive(now)) {
      return response.unauthorized({
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or revoked' },
      })
    }

    // get user
    const user = await User.find(tokenRow.userId)
    if (!user) {
      // user deleted or whatever
      return response.unauthorized({
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' },
      })
    }

    // ROTATION STRATEGY:
    // 1. revoke current refresh token
    tokenRow.revokedAt = now
    await tokenRow.save()

    // 2. issue new refresh token
    const nextPlainRefresh = generatePlainRefreshToken()
    const nextHashed = hashRefreshToken(nextPlainRefresh)

    const nextRefreshRecord = new RefreshToken()
    nextRefreshRecord.userId = user.id
    nextRefreshRecord.hashedToken = nextHashed
    nextRefreshRecord.expiresAt = DateTime.utc().plus({ days: 30 })
    nextRefreshRecord.revokedAt = null
    await nextRefreshRecord.save()

    // 3. issue new access token
    const newAccess = await auth.use('api').createToken(user)

    return response.ok({
      access: {
        type: newAccess.type,
        value: newAccess.value!.release(),
        abilities: newAccess.abilities ?? ['*'],
        expiresAt: newAccess.expiresAt ?? null,
      },
      refresh: {
        value: nextPlainRefresh,
        expiresAt: nextRefreshRecord.expiresAt.toISO(),
      },
    })
  }

  /**
   * Me:
   * - returns profile of the currently authenticated user
   * Assumes middleware.auth({ guards: ['api'] }) already passed
   */
  public async me(ctx: HttpContext) {
    const { auth } = ctx
    const user = auth.user!
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    }
  }

  /**
   * Logout:
   * - invalidate current access token via guard
   * - revoke all refresh tokens (hard logout across all devices)
   * If you want "logout this device only", tu changes la requête pour cibler un refresh token spécifique.
   */
  public async logout(ctx: HttpContext) {
    const { auth } = ctx

    if (auth.isAuthenticated) {
      // invalidate current access token (the guard knows which access token this request used)
      await auth.use('api').invalidateToken()

      // revoke all refresh tokens for this user
      await RefreshToken.query()
        .where('user_id', auth.user!.id)
        .whereNull('revoked_at')
        .update({ revoked_at: DateTime.utc().toSQL() })
    }

    return
  }
}

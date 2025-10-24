import type { AccessToken } from '@adonisjs/auth/access_tokens'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { BaseModel, beforeCreate, beforeSave, column } from '@adonisjs/lucid/orm'
import argon2 from 'argon2'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  declare currentAccessToken?: AccessToken

  static async hashPassword(plain: string) {
    return argon2.hash(plain, { type: argon2.argon2id })
  }

  static async verifyPassword(hash: string, plain: string) {
    return argon2.verify(hash, plain)
  }

  @beforeCreate()
  static assignUuid(user: User) {
    if (!user.id) {
      user.id = randomUUID()
    }
  }

  @beforeSave()
  static async normalizeAndHash(user: User) {
    if (user.$dirty.email) {
      user.email = user.email.trim().toLowerCase()
    }

    if (user.$dirty.password) {
      user.password = await User.hashPassword(user.password)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: 'auth_access_tokens',
    type: 'auth_token',
    prefix: 'oat_',
    tokenSecretLength: 40,
    expiresIn: '15m',
  })
}

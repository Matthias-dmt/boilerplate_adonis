import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare hashedToken: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare revokedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(rt: RefreshToken) {
    if (!rt.id) {
      rt.id = randomUUID()
    }
  }

  /**
   * Helper to know if token is still usable
   */
  public isActive(now: DateTime) {
    if (this.revokedAt) return false
    if (this.expiresAt <= now) return false
    return true
  }
}

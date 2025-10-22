import { BaseModel, beforeCreate, beforeSave, column } from '@adonisjs/lucid/orm'
import argon2 from 'argon2'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class User extends BaseModel {
  @column({ isPrimary: true }) declare id: string
  @column() declare email: string
  @column({ serializeAs: null }) declare password: string
  @column() declare firstName: string
  @column() declare lastName: string
  @column() declare isActive: boolean
  @column.dateTime() declare lastLoginAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @column.dateTime() declare deletedAt: DateTime | null

  static async hashPassword(plain: string) {
    return argon2.hash(plain, { type: argon2.argon2id })
  }
  static async verifyPassword(hash: string, plain: string) {
    return argon2.verify(hash, plain)
  }

  @beforeCreate()
  static assignId(u: User) {
    if (!u.id) u.id = randomUUID()
  }

  @beforeSave()
  static normalize(u: User) {
    if (u.$dirty.email) u.email = u.email.trim().toLowerCase()
  }
}

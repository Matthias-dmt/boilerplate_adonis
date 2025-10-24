import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateRefreshTokens extends BaseSchema {
  protected tableName = 'refresh_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.string('hashed_token').notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('revoked_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['user_id'])
      table.index(['expires_at'])
      table.index(['revoked_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email').notNullable().unique().index()
      table.string('password').notNullable()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.string('role').notNullable().defaultTo('customer').index()
      table.timestamp('last_login_at', { useTz: true })
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).index()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

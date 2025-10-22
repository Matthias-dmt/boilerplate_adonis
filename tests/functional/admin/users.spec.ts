import UserFactory from '#database/factories/user_factory'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { assert } from 'chai'

const ADMIN_AUTH = { authorization: 'Bearer dev' }

test.group('Admin Users routes', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('list users (pagination)', async ({ client }) => {
    await UserFactory.createMany(3)
    const res = await client.get('/v1/admin/users').headers(ADMIN_AUTH)
    res.assertStatus(200)
    assert.isArray(res.body().data)
    assert.containsAllKeys(res.body().meta, ['total', 'perPage', 'currentPage', 'lastPage'])
  })

  test('create user', async ({ client }) => {
    const res = await client.post('/v1/admin/users').headers(ADMIN_AUTH).json({
      email: 'new@example.com',
      password: 'Password!123',
      firstName: 'New',
      lastName: 'User',
    })
    res.assertStatus(201)
  })

  test('update user', async ({ client }) => {
    const u = await UserFactory.create()
    const res = await client
      .patch(`/v1/admin/users/${u.id}`)
      .headers(ADMIN_AUTH)
      .json({ firstName: 'X' })
    res.assertStatus(200)
    res.assertBodyContains({ data: { firstName: 'X' } })
  })

  test('soft delete + restore', async ({ client }) => {
    const u = await UserFactory.create()
    const del = await client.delete(`/v1/admin/users/${u.id}`).headers(ADMIN_AUTH)
    del.assertStatus(204)
    const restore = await client.post(`/v1/admin/users/${u.id}/restore`).headers(ADMIN_AUTH)
    restore.assertStatus(200)
  })
})

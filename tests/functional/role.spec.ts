import UserFactory from '#database/factories/user_factory'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

async function login(client: any, email: string, password = 'Password!123') {
  const res = await client.post('/v1/auth/login').json({ email, password })
  res.assertStatus(200)
  const token = res.body().tokens.access.value as string
  return token
}

test.group('Role middleware (e2e)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('denies when unauthenticated (401)', async ({ client }) => {
    const res = await client.get('/v1/admin/users')
    res.assertStatus(401)
  })

  test('denies when role is customer (403)', async ({ client }) => {
    const u = await UserFactory.merge({ role: 'customer', email: 'c@example.com' }).create()
    const access = await login(client, u.email)
    const res = await client.get('/v1/admin/users').bearerToken(access)
    res.assertStatus(403)
  })

  test('allows admin (200)', async ({ client, assert }) => {
    const u = await UserFactory.merge({ role: 'admin', email: 'a@example.com' }).create()
    const access = await login(client, u.email)
    const res = await client.get('/v1/admin/users').bearerToken(access)
    res.assertStatus(200)
    assert.isArray(res.body().data)
  })

  test('allows super_admin (200)', async ({ client, assert }) => {
    const u = await UserFactory.merge({ role: 'super_admin', email: 's@example.com' }).create()
    const access = await login(client, u.email)
    const res = await client.get('/v1/admin/users').bearerToken(access)
    res.assertStatus(200)
    assert.isArray(res.body().data)
  })

  test('logout invalidates access token (subsequent 401)', async ({ client }) => {
    const u = await UserFactory.merge({ role: 'admin', email: 'logout@example.com' }).create()
    const access = await login(client, u.email)
    const me = await client.get('/v1/auth/me').bearerToken(access)
    me.assertStatus(200)

    const out = await client.post('/v1/auth/logout').bearerToken(access)
    out.assertStatus(204)

    const adminAfterLogout = await client.get('/v1/admin/users').bearerToken(access)
    adminAfterLogout.assertStatus(401)
  })

  test('changing role to customer blocks access (403)', async ({ client }) => {
    const u = await UserFactory.merge({ role: 'admin', email: 'downgrade@example.com' }).create()
    const access = await login(client, u.email)
    await User.query().where('id', u.id).update({ role: 'customer' })
    const res = await client.get('/v1/admin/users').bearerToken(access)
    res.assertStatus(403)
  })
})

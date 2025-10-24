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

test.group('Admin Users errors', (group) => {
  const ADMIN = { authorization: 'Bearer dev' }

  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('401 when auth header missing', async ({ client }) => {
    const res = await client.get('/v1/admin/users')
    res.dumpError()
    res.assertStatus(401)
    res.assertBodyContains({ error: { code: 'UNAUTHENTICATED' } })
  })

  test('400 validation error on create (bad email)', async ({ client }) => {
    const res = await client.post('/v1/admin/users').headers(ADMIN).json({
      email: 'not-an-email',
      password: 'Password!123',
      firstName: 'A',
      lastName: 'B',
    })

    res.dumpError()
    res.assertStatus(422)
    assert.equal(res.response.body.error.code, 'E_VALIDATION_ERROR')
  })

  test('404 on show with unknown id', async ({ client }) => {
    const res = await client
      .get('/v1/admin/users/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .headers(ADMIN)

    res.dumpError()
    res.assertStatus(404)
    res.assertBodyContains({ error: { code: 'USER_NOT_FOUND' } })
  })

  test('409 on create duplicate email', async ({ client }) => {
    await client.post('/v1/admin/users').headers(ADMIN).json({
      email: 'dup@example.com',
      password: 'Password!123',
      firstName: 'A',
      lastName: 'B',
    })
    const res = await client.post('/v1/admin/users').headers(ADMIN).json({
      email: 'dup@example.com',
      password: 'Password!123',
      firstName: 'A',
      lastName: 'B',
    })

    res.dumpError()
    res.assertStatus(409)
    res.assertBodyContains({ error: { code: 'EMAIL_TAKEN' } })
  })

  test('409 on update duplicate email', async ({ client }) => {
    await UserFactory.merge({ email: 'a@example.com' }).create()
    const b = await UserFactory.merge({ email: 'b@example.com' }).create()
    const res = await client
      .patch(`/v1/admin/users/${b.id}`)
      .headers(ADMIN)
      .json({ email: 'a@example.com' })

    res.dumpError()
    res.assertStatus(409)
    res.assertBodyContains({ error: { code: 'EMAIL_TAKEN' } })
  })

  test('404 on restore unknown user', async ({ client }) => {
    const res = await client
      .post('/v1/admin/users/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/restore')
      .headers(ADMIN)

    res.dumpError()
    res.assertStatus(404)
    res.assertBodyContains({ error: { code: 'USER_NOT_FOUND' } })
  })

  test('list supports sort whitelist + search', async ({ client }) => {
    await UserFactory.merge({ firstName: 'Zed', email: 'z@z.com' }).create()
    await UserFactory.merge({ firstName: 'Ann', email: 'a@a.com' }).create()
    const res = await client
      .get('/v1/admin/users?sort=created_at:desc,email:asc&search=a@a.com')
      .headers(ADMIN)
    res.assertStatus(200)
    assert.isArray(res.body().data)
  })
})

import { UserService } from '#services/user_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('UserService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('create + get', async ({ assert }) => {
    const svc = new UserService()
    const u = await svc.create({
      email: 'a@a.com',
      password: 'Password!123',
      firstName: 'A',
      lastName: 'B',
    })
    const got = await svc.get(u.id)
    assert.equal(got.email, 'a@a.com')
  })

  test('reject duplicate email', async ({ assert }) => {
    const svc = new UserService()
    await svc.create({
      email: 'dup@a.com',
      password: 'Password!123',
      firstName: 'A',
      lastName: 'B',
    })
    await assert.rejects(() =>
      svc.create({ email: 'dup@a.com', password: 'Password!123', firstName: 'A', lastName: 'B' })
    )
  })

  test('get not found throws', async ({ assert }) => {
    const svc = new UserService()
    await assert.rejects(() => svc.get('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'))
  })

  test('update not found throws', async ({ assert }) => {
    const svc = new UserService()
    await assert.rejects(() =>
      svc.update('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', { firstName: 'X' })
    )
  })

  test('remove is idempotent (no throw on unknown id)', async ({ assert }) => {
    const svc = new UserService()
    await assert.doesNotReject(() => svc.remove('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'))
  })
})

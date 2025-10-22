import UserFactory from '#database/factories/user_factory'
import { UserRepository } from '#repositories/user_repository'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('UserRepository', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('softDelete + restore', async ({ assert }) => {
    const repo = new UserRepository()
    const u = await UserFactory.create()
    await repo.softDelete(u)
    const missing = await repo.findById(u.id)
    assert.isNull(missing)
    const restored = await repo.restore(u.id)
    assert.equal(restored?.id, u.id)
  })

  test('paginate search + sort', async ({ assert }) => {
    const repo = new UserRepository()
    await UserFactory.merge({ email: 'a@a.com', firstName: 'A' }).create()
    await UserFactory.merge({ email: 'b@b.com', firstName: 'B' }).create()
    const page = await repo.paginate({
      page: 1,
      perPage: 10,
      search: 'a@a.com',
      sorts: [{ field: 'email', direction: 'asc' }],
    })
    assert.equal(page.total, 1)
    assert.equal(page.all()[0].email, 'a@a.com')
  })
})

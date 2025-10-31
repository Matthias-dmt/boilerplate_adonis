import RoleMiddleware from '#middleware/role_middleware'
import { test } from '@japa/runner'

test.group('RoleMiddleware (unit)', () => {
  test('throws when no allowed roles are provided', async ({ assert }) => {
    const mw = new RoleMiddleware()
    const ctx: any = { auth: { user: { role: 'admin' } }, response: { forbidden() {} } }
    const next = async () => {}
    await assert.rejects(() => mw.handle(ctx, next, []), /No allowed roles provided/)
  })
})

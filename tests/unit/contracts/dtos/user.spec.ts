import { toUserDTO } from '#contracts/dtos/user'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test('toUserDTO maps dates safely (null + DateTime)', ({ assert }) => {
  const now = DateTime.utc()
  const dto = toUserDTO({
    id: 'u1',
    email: 'a@a.com',
    firstName: 'A',
    lastName: 'B',
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  })
  assert.equal(dto.lastLoginAt, null)
  assert.isTrue(dto.createdAt.startsWith(now.toISO()?.slice(0, 10) as string))
  assert.isTrue(dto.updatedAt.startsWith(now.toISO()?.slice(0, 10) as string))
})

import { toIso } from '#utils/date'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('toIso()', () => {
  test('handles Luxon DateTime', ({ assert }) => {
    const now = DateTime.utc()
    const got = toIso(now)
    assert.isString(got)
    // Compare prefix to avoid flakiness on sub-ms, and avoid calling toISO() again in expect
    assert.isTrue(got!.startsWith(now.toISO()!.slice(0, 19)))
  })

  test('handles native Date', ({ assert }) => {
    const d = new Date('2025-01-02T03:04:05.000Z')
    const got = toIso(d)
    assert.equal(got, d.toISOString())
  })

  test('handles string passthrough', ({ assert }) => {
    const s = '2025-10-22T00:00:00.000Z'
    assert.equal(toIso(s), s)
  })

  test('handles null/undefined', ({ assert }) => {
    assert.equal(toIso(null), null)
    assert.equal(toIso(undefined), null)
  })
})

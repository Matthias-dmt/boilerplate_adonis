import { USER_DEFAULT_SORT, USER_SORT_FIELDS } from '#contracts/constants/user'
import { parsePagination, parseSort } from '#utils/query'
import { test } from '@japa/runner'

test.group('Query utils', () => {
  test('parsePagination clamps values', ({ assert }) => {
    const a = parsePagination(undefined, undefined)
    assert.deepEqual(a, { page: 1, perPage: 20 })
    const b = parsePagination(0, 999)
    assert.deepEqual(b, { page: 1, perPage: 100 })
    const c = parsePagination('3', '10')
    assert.deepEqual(c, { page: 3, perPage: 10 })
  })

  test('parseSort default + whitelist', ({ assert }) => {
    const fb = USER_DEFAULT_SORT
    assert.deepEqual(parseSort('', USER_SORT_FIELDS, fb), [fb]) // expect fallback
    assert.deepEqual(parseSort('email:asc,created_at:desc', USER_SORT_FIELDS), [
      { field: 'email', direction: 'asc' },
      { field: 'created_at', direction: 'desc' },
    ])
  })
})

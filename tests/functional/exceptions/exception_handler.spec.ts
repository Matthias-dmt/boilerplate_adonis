import router from '@adonisjs/core/services/router'
import { test } from '@japa/runner'
import { assert } from 'chai'

// Register test-only routes (evaluated on import, before server starts)
router.get('/__test/boom', () => {
  throw new Error('boom')
})

router.get('/__test/bad', () => {
  const e: any = new Error('nope')
  e.status = 400
  e.code = 'BAD_REQUEST'
  throw e
})

test.group('Exception handler (dev/test verbose)', () => {
  test('500 => returns verbose payload with stack', async ({ client }) => {
    const res = await client.get('/__test/boom')
    res.assertStatus(500)

    const body = res.body()
    assert.containsAllKeys(body, ['error'])
    assert.containsAllKeys(body.error, ['code', 'message', 'stack'])

    assert.equal(body.error.code, 'INTERNAL_ERROR') // your handler default
    assert.include(body.error.message, 'boom')
    assert.isString(body.error.stack)
  })

  test('custom status/code preserved (400 BAD_REQUEST)', async ({ client }) => {
    const res = await client.get('/__test/bad')
    res.assertStatus(400)

    const body = res.body()
    assert.containsAllKeys(body, ['error'])
    assert.equal(body.error.code, 'BAD_REQUEST')
    assert.include(body.error.message, 'nope')
  })
})

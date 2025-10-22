import { allowedSort } from '#validators/rules/allowed_sort'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'

test.group('allowedSort rule', () => {
  test('accepts whitelisted fields and directions', async ({ assert }) => {
    const schema = vine.compile(vine.object({ sort: vine.string().use(allowedSort(['a', 'b'])()) }))
    const out = await schema.validate({ sort: 'a:asc,b:desc' })
    assert.equal(out.sort, 'a:asc,b:desc')
  })

  test('rejects unknown field', async ({ assert }) => {
    const schema = vine.compile(vine.object({ sort: vine.string().use(allowedSort(['a'])()) }))
    await assert.rejects(() => schema.validate({ sort: 'x:asc' }))
  })

  test('rejects bad direction', async ({ assert }) => {
    const schema = vine.compile(vine.object({ sort: vine.string().use(allowedSort(['a'])()) }))
    await assert.rejects(() => schema.validate({ sort: 'a:sideways' }))
  })
})

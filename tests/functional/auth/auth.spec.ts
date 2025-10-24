import UserFactory from '#database/factories/user_factory'
import RefreshToken from '#models/refresh_token'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const json = (res: any) => res.body()

test.group('Auth flow', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  /**
   * ✅ LOGIN SUCCESS
   */
  test('login success returns access + refresh tokens and creates refresh token row', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({
      email: 'admin@example.com',
    }).create()

    const res = await client.post('/v1/auth/login').json({
      email: user.email,
      password: 'Password!123',
    })
    const rowsTest = await db.from('auth_access_tokens')
    console.log('TOKENS IN DB', rowsTest)

    res.assertStatus(200)
    const body = json(res)

    assert.exists(body.user)
    assert.equal(body.user.email, user.email)

    assert.exists(body.tokens.access)
    assert.exists(body.tokens.refresh)
    assert.isString(body.tokens.access.value)
    assert.isString(body.tokens.refresh.value)

    // Verify refresh token exists in DB
    const rows = await RefreshToken.query().where('user_id', user.id)
    assert.lengthOf(rows, 1, 'should have created exactly one refresh token for this user')
    assert.isNull(rows[0].revokedAt)
  })

  /**
   * ❌ LOGIN FAIL
   */
  test('login fails with bad password and does not create refresh token', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({
      email: 'admin2@example.com',
    }).create()

    const res = await client.post('/v1/auth/login').json({
      email: user.email,
      password: 'WRONG_PASSWORD',
    })

    res.assertStatus(401)

    // Should not have created any refresh token
    const rows = await RefreshToken.query().where('user_id', user.id)
    assert.lengthOf(rows, 0)
  })

  /**
   * 👤 ME WITH VALID TOKEN
   */
  test('me works with valid access token', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      email: 'user3@example.com',
    }).create()

    // login
    const loginRes = await client.post('/v1/auth/login').json({
      email: user.email,
      password: 'Password!123',
    })
    loginRes.assertStatus(200)

    const accessToken = json(loginRes).tokens.access.value

    // call /me
    const meRes = await client.get('/v1/auth/me').header('Authorization', `Bearer ${accessToken}`)

    meRes.assertStatus(200)
    const body = json(meRes)

    assert.equal(body.email, user.email)
    assert.equal(body.id, user.id)
  })

  /**
   * 🔁 REFRESH TOKEN ROTATION
   */
  test('refresh rotates refresh token and returns new access token', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      email: 'user4@example.com',
    }).create()

    // 1. login
    const loginRes = await client.post('/v1/auth/login').json({
      email: user.email,
      password: 'Password!123',
    })
    loginRes.assertStatus(200)

    const first = json(loginRes)
    const oldRefreshToken = first.tokens.refresh.value

    // sanity: exactly 1 active refresh token
    const rowsBefore = await RefreshToken.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'asc')

    assert.lengthOf(rowsBefore, 1)
    assert.isNull(rowsBefore[0].revokedAt)

    // 2. refresh
    const refreshRes = await client.post('/v1/auth/refresh').json({
      refreshToken: oldRefreshToken,
    })

    refreshRes.assertStatus(200)
    const refreshed = json(refreshRes)

    assert.exists(refreshed.access)
    assert.exists(refreshed.refresh)
    assert.isString(refreshed.access.value)
    assert.isString(refreshed.refresh.value)

    // 3. check DB state
    const rowsAfter = await RefreshToken.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'asc')

    assert.lengthOf(rowsAfter, 2)
    const [firstRow, secondRow] = rowsAfter
    assert.isNotNull(firstRow.revokedAt, 'old refresh token must be revoked')
    assert.isNull(secondRow.revokedAt, 'new refresh token must be active')
  })

  /**
   * 🚪 LOGOUT FLOW
   */
  test('logout invalidates access token and revokes all refresh tokens', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({
      email: 'user5@example.com',
    }).create()

    // 1. login
    const loginRes = await client.post('/v1/auth/login').json({
      email: user.email,
      password: 'Password!123',
    })
    loginRes.assertStatus(200)
    const loginBody = json(loginRes)
    const accessToken = loginBody.tokens.access.value

    // 2. /me before logout -> 200
    const meBefore = await client
      .get('/v1/auth/me')
      .header('Authorization', `Bearer ${accessToken}`)
    meBefore.assertStatus(200)

    // 3. logout
    const logoutRes = await client
      .post('/v1/auth/logout')
      .header('Authorization', `Bearer ${accessToken}`)
    logoutRes.assertStatus(204)

    // 4. /me after logout -> 401
    const meAfter = await client.get('/v1/auth/me').header('Authorization', `Bearer ${accessToken}`)
    meAfter.assertStatus(401)

    // 5. all refresh tokens revoked
    const rows = await RefreshToken.query().where('user_id', user.id)
    assert.isAbove(rows.length, 0)
    rows.forEach((row) => {
      assert.isNotNull(row.revokedAt, 'all refresh tokens should be revoked on logout')
    })
  })
})

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import swagger from '#config/swagger'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'

const AuthController = () => import('#controllers/http/auth_controller')
const UsersController = () => import('#controllers/http/admin/users_controller')

router.get('/health', () => ({ data: { status: 'ok' } }))

// returns swagger in YAML
router.get('/v1/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/v1/docs', async () => {
  return AutoSwagger.default.ui('/v1/swagger', swagger)
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead. If you want, you can pass proxy url as second argument here.
  // return AutoSwagger.default.rapidoc("/swagger", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})

// Public auth endpoints
router.post('/v1/auth/login', [AuthController, 'login'])
router.post('/v1/auth/refresh', [AuthController, 'refresh'])

// Protected auth endpoints
router
  .group(() => {
    router.get('/me', [AuthController, 'me'])
    router.post('/logout', [AuthController, 'logout'])
  })
  .prefix('/v1/auth')
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )

// Protected admin endpoints
router
  .group(() => {
    router.resource('users', UsersController).apiOnly()
    router.post('/users/:id/restore', [UsersController, 'restore'])
  })
  .prefix('/v1/admin')
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
  .use(middleware.role(['admin']))

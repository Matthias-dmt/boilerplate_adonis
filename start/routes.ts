/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/http/auth_controller')
const UsersController = () => import('#controllers/http/admin/users_controller')

router.get('/health', () => ({ data: { status: 'ok' } }))

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

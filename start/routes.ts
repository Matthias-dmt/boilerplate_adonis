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
const UsersController = () => import('#controllers/http/admin/users_controller')

router
  .group(() => {
    router.resource('users', UsersController).apiOnly()
    router.post('/users/:id/restore', [UsersController, 'restore'])
  })
  .prefix('/v1/admin')
  .use(middleware.auth())

router.get('/health', () => ({ data: { status: 'ok' } }))

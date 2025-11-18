import { USER_DEFAULT_SORT, USER_SORT_FIELDS } from '#contracts/constants/user'
import { HttpError } from '#exceptions/http_error_exception'
import { UserService } from '#services/user_service'
import { err, ok } from '#utils/api_response'
import { parsePagination, parseSort } from '#utils/query'
import { userCreateValidator } from '#validators/users/user_create'
import { userListQueryValidator } from '#validators/users/user_list_query'
import { userUpdateValidator } from '#validators/users/user_update'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  private svc = new UserService()

  /**
   * @summary List users with pagination / search / sort
   * @tag Users
   * @paramQuery page - Page number for pagination (integer, optional)
   * @paramQuery perPage - Items per page (integer, optional, max 100)
   * @paramQuery search - Filter by email or name (string, optional)
   * @paramQuery sort - Sort fields, e.g. "created_at:desc,email:asc"
   * @responseBody 200 - {
   *   "data": [{
   *     "id": "uuid",
   *     "email": "user@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "isActive": true,
   *     "lastLoginAt": null,
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-01T10:00:00.000Z"
   *   }],
   *   "meta": {
   *     "total": 42,
   *     "perPage": 20,
   *     "currentPage": 1,
   *     "lastPage": 3
   *   }
   * }
   */
  async index({ request, response }: HttpContext) {
    const q = await request.validateUsing(userListQueryValidator)
    const { page, perPage } = parsePagination(q.page, q.perPage)
    const sorts = parseSort(q.sort, USER_SORT_FIELDS, USER_DEFAULT_SORT)
    const res = await this.svc.list({ page, perPage, search: q.search, sorts })
    return response.ok(ok(res.data, res.meta))
  }

  /**
   * @summary Get single user by id
   * @tag Users
   * @paramPath id - User UUID
   * @responseBody 200 - {
   *   "data": {
   *     "id": "uuid",
   *     "email": "user@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "isActive": true,
   *     "lastLoginAt": null,
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-01T10:00:00.000Z"
   *   }
   * }
   * @responseBody 404 - {
   *   "error": {
   *     "code": "USER_NOT_FOUND",
   *     "message": "User not found"
   *   }
   * }
   */
  async show({ params, response }: HttpContext) {
    try {
      const data = await this.svc.get(params.id)
      return response.ok(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }

  /**
   * @summary Create user
   * @tag Users
   * @requestBody {
   *   "email": "new@example.com",
   *   "password": "Password!123",
   *   "firstName": "New",
   *   "lastName": "User",
   *   "isActive": true
   * }
   * @responseBody 201 - {
   *   "data": {
   *     "id": "uuid",
   *     "email": "new@example.com",
   *     "firstName": "New",
   *     "lastName": "User",
   *     "isActive": true,
   *     "lastLoginAt": null,
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-01T10:00:00.000Z"
   *   }
   * }
   * @responseBody 422 - {
   *   "error": {
   *     "code": "VALIDATION_ERROR",
   *     "message": "Invalid payload"
   *   }
   * }
   */
  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(userCreateValidator)
      const data = await this.svc.create(payload)
      return response.created(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }

  /**
   * @summary Update user by id
   * @tag Users
   * @paramPath id - User UUID
   * @requestBody {
   *   "email": "updated@example.com",
   *   "password": "NewPassword!456",
   *   "firstName": "Updated",
   *   "lastName": "Name",
   *   "isActive": false
   * }
   * @responseBody 200 - {
   *   "data": {
   *     "id": "uuid",
   *     "email": "updated@example.com",
   *     "firstName": "Updated",
   *     "lastName": "Name",
   *     "isActive": false,
   *     "lastLoginAt": null,
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-05T14:00:00.000Z"
   *   }
   * }
   * @responseBody 404 - {
   *   "error": {
   *     "code": "USER_NOT_FOUND",
   *     "message": "User not found"
   *   }
   * }
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(userUpdateValidator)
    try {
      const data = await this.svc.update(params.id, payload)
      return response.ok(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }

  /**
   * @summary Soft delete user
   * @tag Users
   * @paramPath id - User UUID
   * @responseBody 204 - {}
   */
  async destroy({ params, response }: HttpContext) {
    await this.svc.remove(params.id)
    return response.noContent()
  }

  /**
   * @summary Restore soft-deleted user
   * @tag Users
   * @paramPath id - User UUID
   * @responseBody 200 - {
   *   "data": {
   *     "id": "uuid",
   *     "email": "restored@example.com",
   *     "firstName": "Restored",
   *     "lastName": "User",
   *     "isActive": true,
   *     "lastLoginAt": null,
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-07T12:00:00.000Z"
   *   }
   * }
   * @responseBody 404 - {
   *   "error": {
   *     "code": "USER_NOT_FOUND",
   *     "message": "User not found"
   *   }
   * }
   */
  async restore({ params, response }: HttpContext) {
    try {
      const data = await this.svc.restore(params.id)
      return response.ok(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }
}

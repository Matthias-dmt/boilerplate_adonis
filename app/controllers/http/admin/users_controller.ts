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

  async index({ request, response }: HttpContext) {
    const q = await request.validateUsing(userListQueryValidator)
    const { page, perPage } = parsePagination(q.page, q.perPage)
    const sorts = parseSort(q.sort)
    const res = await this.svc.list({ page, perPage, search: q.search, sorts })
    return response.ok(ok(res.data, res.meta))
  }

  async show({ params, response }: HttpContext) {
    try {
      const data = await this.svc.get(params.id)
      return response.ok(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(userCreateValidator)
    try {
      const data = await this.svc.create(payload)
      return response.created(ok(data))
    } catch (e) {
      if (e instanceof HttpError) return response.status(e.status).send(err(e.code, e.message))
      throw e
    }
  }

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

  async destroy({ params, response }: HttpContext) {
    await this.svc.remove(params.id)
    return response.noContent()
  }

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

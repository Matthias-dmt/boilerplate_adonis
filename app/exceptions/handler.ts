import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    const status = Number(error.status) || 500

    // Log toujours côté serveur
    ctx.logger.error(error)

    // En test/dev, renvoie le détail pour diagnostiquer
    if (!app.inProduction) {
      return ctx.response.status(status).send({
        error: {
          code: error.code ?? 'INTERNAL_ERROR',
          message: error.message ?? 'Unexpected error',
          stack: error.stack,
        },
      })
    }

    // En prod: message générique
    return ctx.response.status(status).send({
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' },
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}

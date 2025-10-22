export class HttpError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const NotFound = (code = 'NOT_FOUND', msg = 'Resource not found') =>
  new HttpError(404, code, msg)
export const Conflict = (code = 'CONFLICT', msg = 'Conflict') => new HttpError(409, code, msg)

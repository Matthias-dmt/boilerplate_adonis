import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidCredentialsException extends Exception {
  static code = 'E_INVALID_CREDENTIALS'
  static status = 401

  constructor(message = 'Invalid credentials') {
    super(message, { code: InvalidCredentialsException.code })
  }
}

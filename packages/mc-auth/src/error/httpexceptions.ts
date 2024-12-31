import { HTTPException } from 'hono/http-exception'
import { AuthErrorCode } from '../types/error'
import { AUTH_ERROR_DEFINITIONS } from './index'

export const createException = (
  code: AuthErrorCode,
  message: string
): HTTPException => {
  const status = AUTH_ERROR_DEFINITIONS[code].status
  return new HTTPException(status, {
    message,
    cause: { code }
  })
}

export const timeoutException = (): HTTPException => {
  const message = `Request timeout after waiting. Please try again later.`
  return createException('TIMEOUT', message)
}





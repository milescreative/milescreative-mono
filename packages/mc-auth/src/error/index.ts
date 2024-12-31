import { StatusCode } from 'hono/utils/http-status'
import { AuthErrorCode, AuthErrorShape, AuthErrorOptions, ErrorDefinition } from '../types/error'


export const AUTH_ERROR_DEFINITIONS: Record<AuthErrorCode, ErrorDefinition> = {
  INVALID_CONFIG: {
    status: 400 as StatusCode,
    message: 'Invalid configuration provided'
  },
  INVALID_ORIGIN: {
    status: 403 as StatusCode,
    message: 'Invalid request origin'
  },
  METHOD_NOT_ALLOWED: {
    status: 405 as StatusCode,
    message: 'HTTP method not allowed for this endpoint'
  },
  POST_ONLY: {
    status: 405 as StatusCode,
    message: 'This endpoint only accepts POST requests'
  },
  INTERNAL_ERROR: {
    status: 500 as StatusCode,
    message: 'An internal server error occurred'
  },
  NOT_FOUND: {
    status: 404 as StatusCode,
    message: 'The requested resource was not found'
  },
  UNKNOWN_ERROR: {
    status: 500 as StatusCode,
    message: 'An unknown error occurred'
  },
  UNEXPECTED_ERROR: {
    status: 500 as StatusCode,
    message: 'An unexpected error occurred'
  },
  TIMEOUT: {
    status: 408 as StatusCode,
    message: 'The request timed out'
  },
  UNAUTHORIZED: {
    status: 401 as StatusCode,
    message: 'Unauthorized access'
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429 as StatusCode,
    message: 'Rate limit exceeded'
  }
}

export class AuthError extends Error implements AuthErrorShape {
  name: 'AuthError' = 'AuthError'
  code: AuthErrorCode
  status: StatusCode

  constructor(
    code: AuthErrorCode,
    message?: string,
    status?: StatusCode
  ) {
    const errorDef = AUTH_ERROR_DEFINITIONS[code]
    super(message || errorDef.message)
    this.code = code
    this.status = status || errorDef.status
  }
}

export const createAuthError = (
  code: AuthErrorCode,
  options: AuthErrorOptions = {}
): AuthError | never => {
  const error = new AuthError(
    code,
    options.message,
    options.status
  )

  if (options.throw) {
    throw error
  }

  return error
}


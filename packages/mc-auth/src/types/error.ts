import { StatusCode } from 'hono/utils/http-status'

export type AuthErrorCode =
  | 'INVALID_CONFIG'
  | 'INVALID_ORIGIN'
  | 'METHOD_NOT_ALLOWED'
  | 'POST_ONLY'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR'
  | 'UNEXPECTED_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT_EXCEEDED'
export interface ErrorDefinition {
  status: StatusCode
  message: string
}

export interface AuthErrorOptions {
  message?: string
  cause?: Error
  status?: StatusCode
  throw?: boolean
}

export interface AuthErrorShape {
  name: 'AuthError'
  code: AuthErrorCode
  status: StatusCode
  message: string
}

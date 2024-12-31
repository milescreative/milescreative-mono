import { AuthError } from './index'
import { mcLogger } from '../utils/logger'
import { Context } from 'hono'
import { ErrorHandler, NotFoundHandler } from 'hono/types'

export const errorHandler: ErrorHandler = (err: Error, c: Context): Response => {
  mcLogger.error(err instanceof Error ? err.message : String(err), c)

  if (err instanceof AuthError) {
    return new Response(JSON.stringify({
      code: err.code,
      message: err.message,
      status: err.status
    }), {
      status: err.status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // For unknown errors
  return new Response(JSON.stringify({
    error: err instanceof Error ? err.message : String(err),
    code: 'UNEXPECTED_ERROR',
    status: 500
  }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}


export const notFoundHandler: NotFoundHandler = (c: Context): Response => {
  throw new AuthError('NOT_FOUND', `The requested resource ${c.req.url} was not found.`)
}

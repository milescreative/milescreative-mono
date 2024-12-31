import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { timeout } from 'hono/timeout'
import { timeoutException} from './error/httpexceptions'
import { honoLogger} from './utils/logger'
import { logger } from 'hono/logger'
import { errorHandler, notFoundHandler } from './error/handlers'
import { corsMiddleware } from './middleware/cors'
import { csrfMiddleware } from './middleware/csrf'

class mcAuth extends Hono {
  handler(req: Request) {
    return this.fetch(req)
  }
}

//TODO: move to config
const TIMEOUT_DURATION = 5000
const authApi = new mcAuth()


authApi.use(
  '*',
  corsMiddleware,
  csrfMiddleware,
  logger(honoLogger),
  secureHeaders(),
  timeout(TIMEOUT_DURATION, timeoutException)

)

authApi.onError(errorHandler)

authApi.notFound(notFoundHandler)

authApi.get('/api/auth/test', async (c) => {

  return c.text('test');
})

export { authApi }

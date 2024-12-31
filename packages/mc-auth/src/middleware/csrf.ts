import { csrf } from 'hono/csrf';
import { Env } from '../types/env';
import { defaultOptions } from '../config/defaults';

export const csrfMiddleware = csrf({
  origin: (origin, c) => {
    const authOptions = defaultOptions(c.env as Env)
    const allowedOrigins = authOptions.trustedOrigins || []
    return allowedOrigins.includes(origin)
  }
})

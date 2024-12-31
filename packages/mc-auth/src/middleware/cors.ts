
import { AuthError } from '../error';
import { defaultOptions } from '../config/defaults';
import { cors } from 'hono/cors';
import type { Env } from '../types/env';

export const corsMiddleware = cors({
    origin: (origin, c) => {
      const authOptions = defaultOptions(c.env as Env)
      // Allow GET requests without origin check
      if (c.req.method === 'GET' && !origin) return '*'

      const allowedOrigins = authOptions.trustedOrigins || []

      return allowedOrigins.includes(origin)
        ? origin
        : (() => { throw new AuthError('INVALID_ORIGIN', 'Invalid request origin', 403) })()
    },
    allowMethods: ['GET', 'POST'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
    maxAge: 600,
    exposeHeaders: ['Set-Cookie']
  })

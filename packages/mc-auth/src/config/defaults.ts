import type { McAuthOptions } from '../types/config'
import { env } from '../env'
import type { Env } from '../types/env'

// Create a function to get the options
export const defaultOptions = (e: Env = process.env): McAuthOptions => {
  const cEnv = env(e)
  return {
    appName: cEnv.APP_NAME,
    baseURL: cEnv.NODE_ENV === 'development' ? "http://localhost:3000" : cEnv.MC_AUTH_URL,
    basePath: '/api/auth',
    secret: cEnv.MC_AUTH_SECRET,
    trustedOrigins: [cEnv.NODE_ENV === 'development' ? "http://localhost:3000" : cEnv.MC_AUTH_URL]
  }
}


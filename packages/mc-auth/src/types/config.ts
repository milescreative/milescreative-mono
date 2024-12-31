export type McAuthOptions = {
  /**
   * The name of the application
   *
   * process.env.APP_NAME
   *
   * @default "Miles Creative Auth"
   */
  appName?: string
  /**
   * Base URL for the better auth. This is typically the
   * root URL where your application server is hosted.
   * If not explicitly set,
   * the system will check the following environment variable:
   *
   * process.env.MC_AUTH_URL
   *
   * If not set it will throw an error.
   */
  baseURL?: string
  /**
   * Base path for the better auth. This is typically
   * the path where the
   * better auth routes are mounted.
   *
   * @default "/api/auth"
   */
  basePath?: string
  /**
   * The secret to use for encryption,
   * signing and hashing.
   *
   * By default better auth will look for
   * the following environment variables:
   * process.env.MC_AUTH_SECRET,
   * process.env.AUTH_SECRET
   * If none of these environment
   * variables are set,
   * it will default to
   * "mc-auth-secret-123456789".
   */
  secret?: string

  /**
   * List of trusted origins.
   */
  trustedOrigins?: string[]
}

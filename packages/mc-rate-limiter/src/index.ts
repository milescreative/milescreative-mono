export interface RateLimiterOptions {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
}

export class RateLimiter {
  constructor(private options: RateLimiterOptions) {}

  // Placeholder for future implementation
  async isAllowed(key: string): Promise<boolean> {
    // TODO: Implement rate limiting logic
    return true;
  }
}

export default RateLimiter;

import { DatabaseStorageOptions } from './storage/types';
import { Redis } from '@upstash/redis';

interface RateLimiterBaseOptions {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;

  /**
   * Optional error handler
   */
  onError?: (remaining: number, reset: number) => Response;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

interface RedisStorageOptions {
  client: Redis;
}

export interface RateLimiterOptions<
  T extends 'redis' | 'memory' | 'pg-database' = 'memory',
> extends RateLimiterBaseOptions {
  storage?: T extends 'redis'
    ? {
        type: 'redis';
        options: RedisStorageOptions;
      }
    : T extends 'pg-database'
      ? {
          type: 'pg-database';
          options: DatabaseStorageOptions;
        }
      : {
          type?: 'memory';
        };
}

export interface RateLimitStatus {
  /**
   * Number of requests remaining in the current window
   */
  remaining: number;

  /**
   * Timestamp when the current window resets
   */
  reset: number;

  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Whether the rate limit has been exceeded
   */
  exceeded: boolean;
}

export interface RateLimitResult {
  /**
   * Current rate limit status
   */
  status: RateLimitStatus;

  /**
   * Headers containing rate limit information
   */
  headers: Headers;

  /**
   * Whether the request is allowed
   */
  isAllowed: boolean;

  /**
   * Get a Response object based on the rate limit status
   */
  getResponse: () => Response;
}

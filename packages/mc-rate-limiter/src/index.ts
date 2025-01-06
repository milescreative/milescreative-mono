import { DatabaseStorageOptions, Storage } from './storage/types';
import { DatabaseStorage } from './storage/database';
import { RedisClient } from './storage/redis/types';
import { RedisStorage } from './storage/redis';
import { MemoryStorage } from './storage/memory';
import { getClientIp } from './utils/ip';
import { RateLimiterError } from './errors';
import { logger as logger_ } from './utils/logger';
import { RateLimiterOptions, RateLimitResult, RateLimitStatus } from './types';

// Re-export types
export type { DatabaseStorageOptions };

// Factory functions for storage types
function createRedisStorage(client: RedisClient): Storage {
  return new RedisStorage({ client });
}

function createMemoryStorage(): Storage {
  return new MemoryStorage();
}

function validateGlobalConfiguration<
  T extends 'redis' | 'memory' | 'pg-database',
>(options: RateLimiterOptions<T>) {
  // Validate basic options
  if (!options.limit || options.limit <= 0) {
    throw RateLimiterError.InvalidConfiguration(
      'limit must be a positive number'
    );
  }
  if (!options.window || options.window <= 0) {
    throw RateLimiterError.InvalidConfiguration(
      'window must be a positive number'
    );
  }

  const storageType = getStorageType(options);

  // Validate storage configuration
  if (storageType === 'redis') {
    const redisOptions = options as RateLimiterOptions<'redis'>;
    if (!redisOptions.storage?.options?.client) {
      throw RateLimiterError.InvalidConfiguration(
        'Redis client is required for Redis storage'
      );
    }
  } else if (storageType === 'pg-database') {
    const dbOptions = options as RateLimiterOptions<'pg-database'>;
    if (!dbOptions.storage?.options?.connectionString) {
      throw RateLimiterError.InvalidConfiguration(
        'Database connection string is required'
      );
    }
  }
  // Memory storage doesn't need validation
}

/**
 * Creates a rate limiter middleware with specified storage type and configuration
 * @template T - Storage type: 'redis' | 'memory' | 'pg-database'
 * @param {RateLimiterOptions<T>} options - Configuration options
 * @example
 * // Memory storage (default)
 * const rateLimiter = await createRateLimiter({
 *   limit: 100,
 *   window: 60 // seconds
 * });
 *
 * // Redis storage
 * const rateLimiter = await createRateLimiter({
 *   limit: 100,
 *   window: 60,
 *   storage: {
 *     type: 'redis',
 *     options: { client: redisClient }
 *   }
 * });
 *
 * // Postgres storage
 * const rateLimiter = await createRateLimiter({
 *   limit: 100,
 *   window: 60,
 *   storage: {
 *     type: 'pg-database',
 *     options: { connectionString: 'postgresql://...' }
 *   }
 * });
 *
 * @returns {Promise<(request: Request) => Promise<RateLimitResult>>} Rate limiter middleware function
 */
export async function createRateLimiter<
  T extends 'redis' | 'memory' | 'pg-database',
>(options: RateLimiterOptions<T>) {
  const logger = logger_({ enableDebug: options.debug });

  // Validate configuration first
  try {
    validateGlobalConfiguration(options);
  } catch (error) {
    if (error instanceof RateLimiterError) {
      logger.error(`Configuration Error: ${error.message}`);
      return () =>
        Promise.resolve({
          status: {
            remaining: 0,
            reset: Date.now(),
            limit: options.limit,
            exceeded: true,
          },
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          isAllowed: false,
          getResponse: () =>
            new Response(
              JSON.stringify({
                error: error.message + ' at ' + new Date().toISOString(),
                code: error.code,
              }),
              {
                status: 500,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            ),
        });
    }
    throw error;
  }

  let storage: Storage;

  // Initialize storage based on configuration
  try {
    const storageType = getStorageType(options);

    if (storageType === 'redis') {
      logger.debug('Using Redis storage');
      const redisOptions = options as RateLimiterOptions<'redis'>;
      if (!redisOptions.storage?.options?.client) {
        throw RateLimiterError.InvalidConfiguration('Redis client is required');
      }
      storage = createRedisStorage(redisOptions.storage.options.client);
    } else if (storageType === 'pg-database') {
      logger.debug('Using database storage');
      const dbOptions = options as RateLimiterOptions<'pg-database'>;
      if (!dbOptions.storage?.options?.connectionString) {
        throw RateLimiterError.InvalidConfiguration('Database URL is required');
      }
      const dbStorage = new DatabaseStorage(dbOptions);
      await dbStorage.initialize();
      storage = dbStorage;
    } else {
      logger.warn('Using memory storage - not recommended for production');
      storage = createMemoryStorage();
    }
  } catch (error) {
    if (error instanceof RateLimiterError) {
      return () =>
        Promise.resolve({
          status: {
            remaining: 0,
            reset: Date.now(),
            limit: options.limit,
            exceeded: true,
          },
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          isAllowed: false,
          getResponse: () =>
            new Response(
              JSON.stringify({
                error: error.message,
                code: error.code,
              }),
              {
                status: 500,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            ),
        });
    }
    throw error;
  }

  // Return the request handler function
  return async function handleRequest(
    request: Request
  ): Promise<RateLimitResult> {
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const remoteAddr = request.headers.get('remote-addr') || undefined;
      const ip = getClientIp(headers, remoteAddr) || 'unknown';
      logger.debug(`Processing request from ${ip}`);

      // Get current record
      const record = await storage.get(ip);
      const now = Date.now();

      // Check if record exists and is still valid
      if (!record || record.reset <= now) {
        logger.debug(`Creating new rate limit record for ${ip}`);
        // Create new record
        await storage.set(ip, {
          count: 1,
          reset: now + options.window * 1000,
        });

        return createResult(1, now + options.window * 1000, true);
      }

      // Check if limit exceeded
      if (record.count >= options.limit) {
        logger.info(`Rate limit exceeded for ${ip}`);
        return createResult(0, record.reset, false);
      }

      // Increment count
      logger.debug(
        `Incrementing count for ${ip} (${record.count + 1}/${options.limit})`
      );
      await storage.set(ip, {
        count: record.count + 1,
        reset: record.reset,
      });

      return createResult(options.limit - record.count - 1, record.reset, true);
    } catch (error) {
      if (error instanceof RateLimiterError) {
        return {
          status: {
            remaining: 0,
            reset: Date.now(),
            limit: options.limit,
            exceeded: true,
          },
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          isAllowed: false,
          getResponse: () =>
            new Response(
              JSON.stringify({
                error: error.message,
                code: error.code,
              }),
              {
                status: 500,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            ),
        };
      }

      throw error;
    }
  };

  function createResult(
    remaining: number,
    reset: number,
    isAllowed: boolean
  ): RateLimitResult {
    const headers = new Headers({
      'X-RateLimit-Limit': options.limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    });

    const status: RateLimitStatus = {
      remaining,
      reset,
      limit: options.limit,
      exceeded: !isAllowed,
    };

    return {
      status,
      headers,
      isAllowed,
      getResponse: () => {
        if (isAllowed) {
          return new Response(null, {
            status: 200,
            headers: {
              ...Object.fromEntries(headers.entries()),
            },
          });
        }

        if (options.onError) {
          const response = options.onError(remaining, reset);
          // Add rate limit headers to custom response
          for (const [key, value] of headers.entries()) {
            response.headers.set(key, value);
          }
          return response;
        }

        return new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              ...Object.fromEntries(headers.entries()),
            },
          }
        );
      },
    };
  }
}

export function getStorageType<T extends RateLimiterOptions<any>>(
  options: T
): 'redis' | 'memory' | 'pg-database' {
  return options.storage?.type ?? 'memory';
}

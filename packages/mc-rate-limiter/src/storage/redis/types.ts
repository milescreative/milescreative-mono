/**
 * Interface for Redis multi-command chain
 */
export interface RedisMulti {
  set(key: string, value: string): RedisMulti;
  expire(key: string, seconds: number): RedisMulti;
  exec(): Promise<unknown[]>;
}

/**
 * Minimal interface for Redis clients
 */
export interface RedisClient {
  get(key: string): Promise<string | Record<string, any> | null>;
  set(key: string, value: string, opts?: { ex?: number }): Promise<unknown>;
  expire(key: string, seconds: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
  multi?(): RedisMulti;
}

/**
 * Configuration options for Redis storage
 */
export interface RedisStorageOptions {
  /**
   * Redis client instance
   */
  client: RedisClient;

  /**
   * Prefix for Redis keys
   * @default 'ratelimit:'
   */
  prefix?: string;

  /**
   * How often to run cleanup (in seconds)
   * Note: Redis handles cleanup automatically via TTL
   * @default 60
   */
  cleanupInterval?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

import { RateLimitRecord, Storage } from '../types';
import { RedisClient, RedisStorageOptions } from './types';

/**`
 * Redis storage implementation
 * Uses Redis TTL for automatic cleanup
 */
export class RedisStorage implements Storage {
  private client: RedisClient;
  private prefix: string;
  private cleanupInterval: number;
  private cleanupTimeout?: NodeJS.Timeout;
  private debug: boolean;

  constructor(options: RedisStorageOptions) {
    this.client = options.client;
    this.prefix = options.prefix || 'ratelimit:';
    this.cleanupInterval = (options.cleanupInterval || 60) * 1000;
    this.debug = options.debug || false;

    // Start cleanup interval (though Redis handles expiration via TTL)
    this.startCleanup();
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[RedisStorage]', ...args);
    }
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    const redisKey = this.getKey(key);
    const data = await this.client.get(redisKey);

    this.log('GET', redisKey, data);

    if (!data) return null;

    try {
      // Handle both string and object responses
      if (typeof data === 'string') {
        return JSON.parse(data);
      } else if (
        typeof data === 'object' &&
        data.count !== undefined &&
        data.reset !== undefined
      ) {
        return data as RateLimitRecord;
      }
      return null;
    } catch (error) {
      this.log('Error parsing data:', error);
      return null;
    }
  }

  async set(key: string, record: RateLimitRecord): Promise<void> {
    const redisKey = this.getKey(key);
    const ttl = Math.ceil((record.reset - Date.now()) / 1000);
    const value = JSON.stringify(record);

    this.log('SET', redisKey, value, 'TTL:', ttl);

    // Always use separate set and expire for consistency
    try {
      await this.client.set(redisKey, value);
      await this.client.expire(redisKey, ttl);
      this.log('SET success');
    } catch (error) {
      this.log('SET error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const redisKey = this.getKey(key);
    this.log('DELETE', redisKey);
    await this.client.del(redisKey);
  }

  async cleanup(now: number): Promise<void> {
    // Redis automatically removes expired keys
    // This method is included to satisfy the Storage interface
  }

  private startCleanup(): void {
    // Redis handles cleanup automatically via TTL
    // but we'll keep the interval running to match the interface
    this.cleanupTimeout = setInterval(() => {
      this.cleanup(Date.now()).catch(console.error);
    }, this.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimeout) {
      clearInterval(this.cleanupTimeout);
    }
  }
}

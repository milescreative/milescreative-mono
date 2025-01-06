import { RateLimitRecord, Storage } from './types';

/**
 * Ultra-compact record structure using a single number
 * Bits 0-31: count (supports up to 4 billion requests)
 * Bits 32-63: resetAt timestamp in seconds (not milliseconds)
 */
class CompactRecord {
  private data: bigint;

  constructor(count: number, resetAtMs: number) {
    // Store reset time in seconds
    const resetAtSec = BigInt(Math.floor(resetAtMs / 1000));
    this.data = (resetAtSec << 32n) | BigInt(count);
  }

  get count(): number {
    return Number(this.data & 0xffffffffn);
  }

  get reset(): number {
    // Convert back to milliseconds for consistency with other implementations
    return Number(this.data >> 32n) * 1000;
  }

  increment(): void {
    this.data = (this.data & ~0xffffffffn) | ((this.data & 0xffffffffn) + 1n);
  }
}

/**
 * Memory storage implementation with optimizations for:
 * - Memory usage (compact record structure)
 * - Cleanup performance (expiration index)
 * - Fast path for common operations
 */
export class MemoryStorage implements Storage {
  // Make storage static to share across instances
  private static store = new Map<string, CompactRecord>();
  private static expirationIndex = new Map<number, Set<string>>();
  private readonly bucketSize = 10; // 10 second buckets
  private static lastCleanup = 0;
  private static readonly cleanupInterval = 10000; // 10 seconds

  private getBucket(timestamp: number): number {
    // Convert ms to seconds for bucketing
    return Math.floor(timestamp / 1000 / this.bucketSize) * this.bucketSize;
  }

  private maybeCleanup(): void {
    const now = Date.now();
    // Only cleanup if enough time has passed since last cleanup
    if (now - MemoryStorage.lastCleanup >= MemoryStorage.cleanupInterval) {
      this.cleanup(now).catch(console.error);
      MemoryStorage.lastCleanup = now;
    }
  }

  private addToExpirationIndex(key: string, resetAt: number): void {
    const bucket = this.getBucket(resetAt);
    let keys = MemoryStorage.expirationIndex.get(bucket);
    if (!keys) {
      keys = new Set();
      MemoryStorage.expirationIndex.set(bucket, keys);
    }
    keys.add(key);
  }

  private removeFromExpirationIndex(key: string, resetAt: number): void {
    const bucket = this.getBucket(resetAt);
    const keys = MemoryStorage.expirationIndex.get(bucket);
    if (keys) {
      keys.delete(key);
      if (keys.size === 0) {
        MemoryStorage.expirationIndex.delete(bucket);
      }
    }
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    this.maybeCleanup();
    const record = MemoryStorage.store.get(key);
    if (!record) return null;

    // Check if record has expired
    if (record.reset <= Date.now()) {
      MemoryStorage.store.delete(key);
      return null;
    }

    return {
      count: record.count,
      reset: record.reset,
    };
  }

  async set(key: string, record: RateLimitRecord): Promise<void> {
    this.maybeCleanup();
    // Remove from old expiration bucket if exists
    const oldRecord = MemoryStorage.store.get(key);
    if (oldRecord) {
      this.removeFromExpirationIndex(key, oldRecord.reset);
    }

    // Add new record
    const compactRecord = new CompactRecord(record.count, record.reset);
    MemoryStorage.store.set(key, compactRecord);
    this.addToExpirationIndex(key, record.reset);
  }

  async delete(key: string): Promise<void> {
    const record = MemoryStorage.store.get(key);
    if (record) {
      this.removeFromExpirationIndex(key, record.reset);
      MemoryStorage.store.delete(key);
    }
  }

  async cleanup(now: number): Promise<void> {
    const currentBucket = this.getBucket(now);

    // Find all expired buckets
    const expiredBuckets: number[] = [];
    for (const [bucket, keys] of MemoryStorage.expirationIndex.entries()) {
      if (bucket <= currentBucket) {
        // Delete all keys in this bucket
        for (const key of keys) {
          MemoryStorage.store.delete(key);
        }
        expiredBuckets.push(bucket);
      } else {
        // Buckets are ordered, so we can stop here
        break;
      }
    }

    // Remove expired buckets from index
    for (const bucket of expiredBuckets) {
      MemoryStorage.expirationIndex.delete(bucket);
    }
  }
}

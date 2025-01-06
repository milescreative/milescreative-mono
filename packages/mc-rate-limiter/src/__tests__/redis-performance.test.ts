import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Redis } from '@upstash/redis';
import { RateLimiter } from '../index';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { createEnv } from '@t3-oss/env-core';

const env = createEnv({
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1)
  },
  runtimeEnv: process.env
});

// Helper to measure execution time
const measureTime = async (fn: () => Promise<void>, iterations: number): Promise<number> => {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  return times.reduce((a, b) => a + b, 0) / times.length;
};

// Helper to measure memory usage
const measureMemory = (): number => {
  const used = process.memoryUsage();
  return Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
};

// Calculate score based on performance metrics
const calculateScore = (value: number, thresholds: { min: number; max: number }): number => {
  const score = 100 - ((value - thresholds.min) / (thresholds.max - thresholds.min)) * 100;
  return Math.min(100, Math.max(0, score));
};

// Performance thresholds (adjusted for Redis REST API latency)
const thresholds = {
  singleKey: { min: 0, max: 50 },       // ms per operation
  multipleKeys: { min: 0, max: 100 },   // ms per operation
  ipDetection: { min: 0, max: 75 },     // ms per operation
  cleanup: { min: 0, max: 100 },        // ms per operation
  memory: { min: 0.1, max: 10 },        // MB for 1k records
  burst: { min: 0, max: 50 }           // ms per operation
};

// Score weights
const weights = {
  singleKey: 0.3,     // 30%
  multipleKeys: 0.15, // 15%
  ipDetection: 0.2,   // 20%
  cleanup: 0.1,       // 10%
  memory: 0.1,        // 10%
  burst: 0.15         // 15%
};

describe('Rate Limiter Redis Performance', () => {
  let limiter: RateLimiter;
  let redis: Redis;
  const logDir = join(process.cwd(), 'logs');
  const logFile = join(logDir, 'redis-performance.log');
  const scores: Record<string, number> = {};
  const results: string[] = [];

  // Set longer timeout for all tests
  const TEST_TIMEOUT = 30000;

  // Helper to store performance results for final logging
  const storeResult = (message: string) => {
    results.push(message);
  };

  beforeAll(() => {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    });

    limiter = new RateLimiter({
      limit: 5,
      window: 10,
      storage: {
        client: redis,
        prefix: 'test:perf:',
        debug: false
      }
    });
  });

  afterAll(async () => {
    // Create log directory if it doesn't exist
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    // Clear log file
    writeFileSync(logFile, '');

    // Write all results at once
    const now = new Date().toISOString();
    writeFileSync(logFile, '==================================================\n', { flag: 'a' });
    writeFileSync(logFile, `[${now}] Redis Performance Test Run - v0.0.1\n`, { flag: 'a' });
    writeFileSync(logFile, '==================================================\n', { flag: 'a' });

    // Write test results
    results.forEach(result => {
      writeFileSync(logFile, result + '\n', { flag: 'a' });
    });

    // Write final scores
    writeFileSync(logFile, '--------------------------------------------------\n', { flag: 'a' });
    Object.entries(scores).forEach(([key, score]) => {
      writeFileSync(logFile, `${key} Score: ${score.toFixed(1)}/100 (Weight: ${(weights[key as keyof typeof weights] * 100)}%)\n`, { flag: 'a' });
    });

    // Calculate and write final score
    const finalScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + score * weights[key as keyof typeof weights];
    }, 0);

    writeFileSync(logFile, '--------------------------------------------------\n', { flag: 'a' });
    writeFileSync(logFile, `Final Score: ${finalScore.toFixed(1)}/100 - ${finalScore >= 90 ? 'Excellent' : finalScore >= 70 ? 'Good' : 'Needs Improvement'}\n`, { flag: 'a' });
    writeFileSync(logFile, 'Test run complete\n', { flag: 'a' });

    // Clean up test keys using SCAN instead of KEYS
    let cursor = 0;
    const pattern = 'test:perf:*';
    const batchSize = 100;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: pattern,
        count: batchSize
      });

      cursor = Number(nextCursor);

      if (keys.length > 0) {
        // Delete in smaller batches to avoid overwhelming Redis
        for (let i = 0; i < keys.length; i += 50) {
          const batch = keys.slice(i, i + 50);
          await redis.del(...batch);
        }
      }
    } while (cursor !== 0);

    // Cleanup
    limiter.destroy();
  });

  it('measures single key performance', async () => {
    const key = 'test:single';
    const time = await measureTime(async () => {
      await limiter.checkLimit(key);
    }, 25); // Further reduced iterations

    scores.singleKey = calculateScore(time, thresholds.singleKey);
    storeResult(`Single key check: ${time.toFixed(3)}ms average (25 iterations) - Score: ${scores.singleKey.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.singleKey.max);
  }, TEST_TIMEOUT);

  it('measures multiple keys performance', async () => {
    const time = await measureTime(async () => {
      for (let i = 0; i < 25; i++) { // Further reduced keys
        await limiter.checkLimit(`test:multi:${i}`);
      }
    }, 3);

    scores.multipleKeys = calculateScore(time / 25, thresholds.multipleKeys);
    storeResult(`Multiple keys (25) check: ${(time / 25).toFixed(3)}ms average (3 iterations) - Score: ${scores.multipleKeys.toFixed(1)}/100`);
    expect(time / 25).toBeLessThan(thresholds.multipleKeys.max);
  }, TEST_TIMEOUT);

  it('measures IP header detection performance', async () => {
    const headers = {
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      'x-real-ip': '9.10.11.12'
    };

    const time = await measureTime(async () => {
      await limiter.handleRequest(new Request('http://localhost', { headers }));
    }, 25); // Further reduced iterations

    scores.ipDetection = calculateScore(time, thresholds.ipDetection);
    storeResult(`IP header detection: ${time.toFixed(3)}ms average (25 iterations) - Score: ${scores.ipDetection.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.ipDetection.max);
  }, TEST_TIMEOUT);

  it('measures cleanup performance', async () => {
    // Add 100 records (reduced from 500)
    for (let i = 0; i < 100; i++) {
      await limiter.checkLimit(`test:cleanup:${i}`);
    }

    const time = await measureTime(async () => {
      const now = Date.now() + 11000; // Force cleanup
      await (limiter as any).storage.cleanup(now);
    }, 3);

    scores.cleanup = calculateScore(time, thresholds.cleanup);
    storeResult(`Cleanup with 100 keys: ${time.toFixed(3)}ms average (3 iterations) - Score: ${scores.cleanup.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.cleanup.max);
  }, TEST_TIMEOUT);

  it('measures memory usage', async () => {
    const baseMemory = measureMemory();

    // Add 100 records (reduced from 500)
    for (let i = 0; i < 100; i++) {
      await limiter.checkLimit(`test:memory:${i}`);
    }

    const usedMemory = measureMemory() - baseMemory;
    scores.memory = calculateScore(usedMemory, thresholds.memory);
    storeResult(`Memory usage for 100 keys: ${usedMemory.toFixed(2)}MB - Score: ${scores.memory.toFixed(1)}/100`);
    expect(usedMemory).toBeLessThan(thresholds.memory.max);
  }, TEST_TIMEOUT);

  it('measures burst performance', async () => {
    const time = await measureTime(async () => {
      const promises = Array(25).fill(0).map((_, i) => // Further reduced concurrent requests
        limiter.checkLimit(`test:burst:${i}`)
      );
      await Promise.all(promises);
    }, 3);

    scores.burst = calculateScore(time / 25, thresholds.burst);
    storeResult(`Burst performance (25 concurrent requests): ${(time / 25).toFixed(3)}ms average (3 iterations) - Score: ${scores.burst.toFixed(1)}/100`);
    expect(time / 25).toBeLessThan(thresholds.burst.max);
  }, TEST_TIMEOUT);
});

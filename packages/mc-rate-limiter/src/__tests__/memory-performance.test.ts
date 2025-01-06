import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RateLimiter } from '../index';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

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

// Performance thresholds
const thresholds = {
  singleKey: { min: 0, max: 0.1 },     // ms per operation
  multipleKeys: { min: 0, max: 0.2 },  // ms per operation
  ipDetection: { min: 0, max: 0.05 },  // ms per operation
  cleanup: { min: 0, max: 0.5 },       // ms per operation
  memory: { min: 0.1, max: 5 },        // MB for 10k records
  burst: { min: 0, max: 0.2 }          // ms per operation
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

describe('Rate Limiter Memory Performance', () => {
  let limiter: RateLimiter;
  const logFile = join(process.cwd(), 'logs', 'memory-performance.log');
  const scores: Record<string, number> = {};

  // Helper to log performance results
  const logPerformance = (message: string) => {
    if (!existsSync(join(process.cwd(), 'logs'))) {
      mkdirSync(join(process.cwd(), 'logs'));
    }
    writeFileSync(logFile, message + '\n', { flag: 'a' });
  };

  beforeAll(() => {
    limiter = new RateLimiter({
      limit: 5,
      window: 10
    });

    // Clear log file
    writeFileSync(logFile, '');

    // Start test run log
    const now = new Date().toISOString();
    logPerformance('==================================================');
    logPerformance(`[${now}] Memory Performance Test Run - v0.0.1`);
    logPerformance('==================================================');
  });

  afterAll(() => {
    // Log final scores
    logPerformance('--------------------------------------------------');
    Object.entries(scores).forEach(([key, score]) => {
      logPerformance(`${key} Score: ${score.toFixed(1)}/100 (Weight: ${(weights[key as keyof typeof weights] * 100)}%)`);
    });

    // Calculate final score
    const finalScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + score * weights[key as keyof typeof weights];
    }, 0);

    logPerformance('--------------------------------------------------');
    logPerformance(`Final Score: ${finalScore.toFixed(1)}/100 - ${finalScore >= 90 ? 'Excellent' : finalScore >= 70 ? 'Good' : 'Needs Improvement'}`);
    logPerformance('Test run complete');

    // Cleanup
    limiter.destroy();
  });

  it('measures single key performance', async () => {
    const key = 'test:single';
    const time = await measureTime(async () => {
      await limiter.checkLimit(key);
    }, 10000);

    scores.singleKey = calculateScore(time, thresholds.singleKey);
    logPerformance(`Single key check: ${time.toFixed(3)}ms average (10,000 iterations) - Score: ${scores.singleKey.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.singleKey.max);
  });

  it('measures multiple keys performance', async () => {
    const time = await measureTime(async () => {
      for (let i = 0; i < 1000; i++) {
        await limiter.checkLimit(`test:multi:${i}`);
      }
    }, 10);

    scores.multipleKeys = calculateScore(time / 1000, thresholds.multipleKeys);
    logPerformance(`Multiple keys (1000) check: ${(time / 1000).toFixed(3)}ms average (10 iterations) - Score: ${scores.multipleKeys.toFixed(1)}/100`);
    expect(time / 1000).toBeLessThan(thresholds.multipleKeys.max);
  });

  it('measures IP header detection performance', async () => {
    const headers = {
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      'x-real-ip': '9.10.11.12'
    };

    const time = await measureTime(async () => {
      await limiter.handleRequest(new Request('http://localhost', { headers }));
    }, 10000);

    scores.ipDetection = calculateScore(time, thresholds.ipDetection);
    logPerformance(`IP header detection: ${time.toFixed(3)}ms average (10,000 iterations) - Score: ${scores.ipDetection.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.ipDetection.max);
  });

  it('measures cleanup performance', async () => {
    // Add 10,000 records first
    for (let i = 0; i < 10000; i++) {
      await limiter.checkLimit(`test:cleanup:${i}`);
    }

    const time = await measureTime(async () => {
      const now = Date.now() + 11000; // Force cleanup
      await (limiter as any).storage.cleanup(now);
    }, 100);

    scores.cleanup = calculateScore(time, thresholds.cleanup);
    logPerformance(`Cleanup with 10,000 keys: ${time.toFixed(3)}ms average (100 iterations) - Score: ${scores.cleanup.toFixed(1)}/100`);
    expect(time).toBeLessThan(thresholds.cleanup.max);
  });

  it('measures memory usage', async () => {
    const baseMemory = measureMemory();

    // Add 10,000 records
    for (let i = 0; i < 10000; i++) {
      await limiter.checkLimit(`test:memory:${i}`);
    }

    const usedMemory = measureMemory() - baseMemory;
    scores.memory = calculateScore(usedMemory, thresholds.memory);
    logPerformance(`Memory usage for 10,000 keys: ${usedMemory.toFixed(2)}MB - Score: ${scores.memory.toFixed(1)}/100`);
    expect(usedMemory).toBeLessThan(thresholds.memory.max);
  });

  it('measures burst performance', async () => {
    const time = await measureTime(async () => {
      const promises = Array(1000).fill(0).map((_, i) =>
        limiter.checkLimit(`test:burst:${i}`)
      );
      await Promise.all(promises);
    }, 10);

    scores.burst = calculateScore(time / 1000, thresholds.burst);
    logPerformance(`Burst performance (1000 requests): ${(time / 1000).toFixed(3)}ms average (10 iterations) - Score: ${scores.burst.toFixed(1)}/100`);
    expect(time / 1000).toBeLessThan(thresholds.burst.max);
  });
});

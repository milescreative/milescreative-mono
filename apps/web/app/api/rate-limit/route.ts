import { createRateLimiter } from '@milescreative/mc-rate-limiter';
import { Redis } from '@upstash/redis';

const client = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  const rateLimiter = await createRateLimiter({
    limit: 5,
    window: 10,
    // storage: {
    //   type: 'pg-database',
    //   options: {
    //     connectionString: process.env.DATABASE_URL!,
    //     tableName: 'rate_limit',
    //     columns: {
    //       id: 'id',
    //       count: 'count',
    //       reset: 'reset',
    //       createdAt: 'created_at',
    //       updatedAt: 'updated_at',
    //     },
    //   },
    // },
    debug: true,
    storage: {},

    // storage: {
    //   type: 'redis',
    //   options: {
    //     client,
    //   },
    // },
  });

  const result = await rateLimiter(request);

  if (!result.isAllowed) {
    return result.getResponse();
  }

  return new Response('Hello World', {
    headers: result.headers,
  });
}

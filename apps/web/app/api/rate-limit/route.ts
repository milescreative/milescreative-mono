import { createRateLimiter } from '@milescreative/mc-rate-limiter';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://supreme-monarch-52653.upstash.io',
  token: 'Ac2tAAIjcDEzNmJjYjk4YjcxOTA0NTA0OTE3OTgxOWMxM2E2NDNkY3AxMA',
})

const rateLimiter = createRateLimiter({
  limit: 5,
  window: 10,
  onError: (remaining, reset) => {
    return new Response(`Rate limit exceeded.. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds`, { status: 429 });
  },
  storage: {
    client: redis,
    prefix: 'rate-limit-test:',
    debug: true
  }
});

export async function GET(request: Request) {
  // Rate limit the request
  const result = await rateLimiter(request);

  // You can access status information
  console.log(`Requests remaining: ${result.status.remaining}`);
  console.log(`Reset time: ${result.status.reset}`);
  console.log(`Rate limit exceeded: ${result.status.exceeded}`);

  // If rate limit exceeded, return the error response
  if (!result.isAllowed) {
    return result.getResponse();
  }

  // Otherwise, handle the request normally
  // The response will automatically include rate limit headers
  const response = new Response('Hello World');
  result.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

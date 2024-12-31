import { describe, expect, it, beforeEach } from 'vitest';
import { GET } from '../route';
import { headers } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map([['x-forwarded-for', '127.0.0.1']])
}));

describe('Rate Limiter API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rate limiting correctly', async () => {
    // First 5 requests should succeed
    for (let i = 0; i < 5; i++) {
      const response = await GET(new Request('http://localhost'));
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.requestsRemaining).toBe(4 - i);
    }

    // 6th request should fail
    const response = await GET(new Request('http://localhost'));
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toBe('Too Many Requests');
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  it('should reset after window expires', async () => {
    // Make initial request
    const firstResponse = await GET(new Request('http://localhost'));
    expect(firstResponse.status).toBe(200);

    // Wait for window to expire (10 seconds)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Should be able to make request again
    const secondResponse = await GET(new Request('http://localhost'));
    expect(secondResponse.status).toBe(200);

    const data = await secondResponse.json();
    expect(data.requestsRemaining).toBe(4);
  });

  it('should track different IPs separately', async () => {
    // Mock different IPs
    vi.mocked(headers).mockReturnValueOnce(new Map([['x-forwarded-for', '1.1.1.1']]));
    vi.mocked(headers).mockReturnValueOnce(new Map([['x-forwarded-for', '2.2.2.2']]));

    // Both IPs should get their full quota
    const ip1Response = await GET(new Request('http://localhost'));
    const ip2Response = await GET(new Request('http://localhost'));

    expect(ip1Response.status).toBe(200);
    expect(ip2Response.status).toBe(200);

    const data1 = await ip1Response.json();
    const data2 = await ip2Response.json();

    expect(data1.requestsRemaining).toBe(4);
    expect(data2.requestsRemaining).toBe(4);
  });
});

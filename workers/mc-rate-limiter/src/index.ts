import { DurableObject } from "cloudflare:workers";
import { getClientIp } from "@milescreative/mc-rate-limiter/ip";

export interface Env {
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
}

// Worker
export default {
  async fetch(request, env, _ctx): Promise<Response> {
    // Determine the IP address of the client
    const ip = getClientIp(request.headers);
    if (ip === null) {
      return new Response("Could not determine client IP", { status: 400 });
    }

    // Obtain an identifier for a Durable Object based on the client's IP address
    const id = env.RATE_LIMITER.idFromName(ip);

    try {
      const stub = env.RATE_LIMITER.get(id);
      const milliseconds_to_next_request = await stub.getMillisecondsToNextRequest();
      if (milliseconds_to_next_request > 0) {
        // Alternatively one could sleep for the necessary length of time
        return new Response("Rate limit exceeded", { status: 429 });
      }
    } catch (error) {
      return new Response("Could not connect to rate limiter", { status: 502 });
    }

    // TODO: Implement me
    return new Response("Call some upstream resource...")
  }
} satisfies ExportedHandler<Env>;

// Durable Object
export class RateLimiter extends DurableObject {
  static readonly milliseconds_per_request = 1;
  static readonly milliseconds_for_updates = 5000;
  static readonly capacity = 10;

  tokens: number;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.tokens = RateLimiter.capacity;
  }

  async getMillisecondsToNextRequest(): Promise<number> {
    this.checkAndSetAlarm()

    let milliseconds_to_next_request = RateLimiter.milliseconds_per_request;
    if (this.tokens > 0) {
      this.tokens -= 1;
      milliseconds_to_next_request = 0;
    }

    return milliseconds_to_next_request;
  }

  private async checkAndSetAlarm() {
    let currentAlarm = await this.ctx.storage.getAlarm();
    if (currentAlarm == null) {
      this.ctx.storage.setAlarm(Date.now() +
        RateLimiter.milliseconds_for_updates * RateLimiter.milliseconds_per_request);
    }
  }

  async alarm() {
    if (this.tokens < RateLimiter.capacity) {
      this.tokens = Math.min(RateLimiter.capacity,
        this.tokens + RateLimiter.milliseconds_for_updates);
      this.checkAndSetAlarm()
    }
  }
}

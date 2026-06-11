import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful degradation — if Redis not configured, allow all requests
function makeRatelimiter(requests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window as any) });
}

export const adminRatelimit  = makeRatelimiter(30,  "1 m");  // 30/min on admin API
export const loginRatelimit  = makeRatelimiter(10,  "1 m");  // 10/min on login
export const uploadRatelimit = makeRatelimiter(5,   "1 h");  // 5/hr on image upload

export async function checkRateLimit(
  limiter: ReturnType<typeof makeRatelimiter>,
  identifier: string
): Promise<{ allowed: boolean; remaining?: number }> {
  if (!limiter) return { allowed: true };
  const { success, remaining } = await limiter.limit(identifier);
  return { allowed: success, remaining };
}

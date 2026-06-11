// Lazy rate limiting — limiters created on first use, never at module load
// Gracefully skips if Redis not configured or URL is invalid

function isValidUpstashUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch { return false; }
}

function redisReady(): boolean {
  return (
    isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL) &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

type Limiter = { limit: (id: string) => Promise<{ success: boolean; remaining: number }> } | null;

// Cache limiters after first creation
const cache: Record<string, Limiter> = {};

function getLimiter(key: string, requests: number, window: string): Limiter {
  if (key in cache) return cache[key];
  if (!redisReady()) { cache[key] = null; return null; }
  try {
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis }     = require("@upstash/redis");
    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    cache[key] = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
  } catch { cache[key] = null; }
  return cache[key];
}

export async function checkRateLimit(
  key: string,
  identifier: string,
  requests = 30,
  window = "1 m"
): Promise<{ allowed: boolean; remaining?: number }> {
  const limiter = getLimiter(key, requests, window);
  if (!limiter) return { allowed: true };
  try {
    const { success, remaining } = await limiter.limit(identifier);
    return { allowed: success, remaining };
  } catch { return { allowed: true }; }
}

// Named limiters for convenience — same signature as before but lazy
export const adminRatelimit  = null; // not used directly — use checkRateLimit("admin", ...)
export const loginRatelimit  = null;
export const uploadRatelimit = null;

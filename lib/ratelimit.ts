import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type Bucket = "default" | "list" | "availability";

const ratelimits: Partial<Record<Bucket, Ratelimit>> = {};

let warned = false;

function getRateLimiter(bucket: Bucket = "default"): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!warned) {
      console.warn("[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled.");
      warned = true;
    }
    return null;
  }

  if (!ratelimits[bucket]) {
    // Separate limits per bucket (Upstash multi-limiter pattern) — distinct prefix
    // keeps counters isolated in Redis. "default" (3/15m) guards sensitive flows
    // (auth, contact, availability); "list" (30/15m) is a looser public catalog read.
    // "availability" (60/1m) is looser still: toggling the schedule grid on several
    // courts fires one request per court+date, so a tight bucket would throttle
    // normal browsing.
    ratelimits[bucket] = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter:
        bucket === "list"
          ? Ratelimit.slidingWindow(30, "15 m")
          : bucket === "availability"
            ? Ratelimit.slidingWindow(60, "1 m")
            : Ratelimit.slidingWindow(3, "15 m"),
      analytics: true,
      prefix:
        bucket === "list"
          ? "ratelimit:list"
          : bucket === "availability"
            ? "ratelimit:availability"
            : "ratelimit",
    });
  }

  return ratelimits[bucket];
}

/**
 * Centralized rate-limit check (Upstash SDK best practice).
 * Awaits `pending` so the analytics write flushes before the serverless function returns.
 * Returns `{ success: true }` when Redis env is missing (rate limiting disabled).
 */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  return runRateLimit(getRateLimiter("default"), identifier);
}

/**
 * Looser rate limit for high-frequency public read endpoints (e.g. court catalog list).
 */
export async function checkRateLimitRelaxed(identifier: string): Promise<{ success: boolean }> {
  return runRateLimit(getRateLimiter("list"), identifier);
}

/**
 * Rate limit for the court availability grid. Looser than the default bucket
 * because toggling the schedule on several courts fires one request per court+date.
 */
export async function checkRateLimitAvailability(identifier: string): Promise<{ success: boolean }> {
  return runRateLimit(getRateLimiter("availability"), identifier);
}

async function runRateLimit(
  rateLimiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean }> {
  if (!rateLimiter) {
    return { success: true };
  }
  const { success, pending } = await rateLimiter.limit(identifier);
  await pending;
  return { success };
}

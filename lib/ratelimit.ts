import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type Bucket = "default" | "list" | "availability";

const ratelimits: Partial<Record<Bucket, Ratelimit>> = {};

const ephemeralCaches: Record<Bucket, Map<string, number>> = {
  default: new Map(),
  list: new Map(),
  availability: new Map(),
};

let warned = false;

function getRateLimiter(bucket: Bucket = "default"): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!warned) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "[SECURITY CRITICAL] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing in production! Rate limiting is bypassed."
        );
      } else {
        console.warn("[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled.");
      }
      warned = true;
    }
    return null;
  }

  if (!ratelimits[bucket]) {
    // Distinct Redis prefixes keep counters isolated per bucket. The availability
    // bucket allows more requests per minute because toggling the schedule grid
    // across several courts fires one request per court and date.
    ratelimits[bucket] = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter:
        bucket === "list"
          ? Ratelimit.slidingWindow(30, "15 m")
          : bucket === "availability"
            ? Ratelimit.slidingWindow(60, "1 m")
            : Ratelimit.slidingWindow(3, "15 m"),
      analytics: true,
      ephemeralCache: ephemeralCaches[bucket],
      timeout: 3000,
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

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  return runRateLimit(getRateLimiter("default"), identifier);
}

export async function checkRateLimitRelaxed(identifier: string): Promise<{ success: boolean }> {
  return runRateLimit(getRateLimiter("list"), identifier);
}

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
  // Await pending so the analytics write flushes before the serverless function returns.
  const { success, pending } = await rateLimiter.limit(identifier);
  await pending;
  return { success };
}

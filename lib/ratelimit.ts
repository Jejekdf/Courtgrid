import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let ratelimit: Ratelimit | null | undefined;

let warned = false;

function getRateLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!warned) {
      console.warn("[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled.");
      warned = true;
    }
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      analytics: true,
      prefix: "ratelimit",
    });
  }

  return ratelimit;
}

/**
 * Centralized rate-limit check (Upstash SDK best practice).
 * Awaits `pending` so the analytics write flushes before the serverless function returns.
 * Returns `{ success: true }` when Redis env is missing (rate limiting disabled).
 */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  const rateLimiter = getRateLimiter();
  if (!rateLimiter) {
    return { success: true };
  }
  const { success, pending } = await rateLimiter.limit(identifier);
  await pending;
  return { success };
}
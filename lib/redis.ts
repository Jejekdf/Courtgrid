import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      enableAutoPipelining: true,
    });
  }

  return redisClient;
}

const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Cache helper with singleflight deduplication to get or set JSON data in Redis.
 * Concurrent requests for the same key await the single active promise to prevent cache stampedes.
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    } catch (err) {
      console.warn(`[Redis Cache GET Error] Key: ${key}`, err);
    }
  }

  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) {
    return existingPromise as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const freshData = await fetchFn();
      if (redis && freshData !== null && freshData !== undefined) {
        try {
          await redis.set(key, freshData, { ex: ttlSeconds });
        } catch (err) {
          console.warn(`[Redis Cache SET Error] Key: ${key}`, err);
        }
      }
      return freshData;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidate cache key(s)
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch (err) {
    console.warn(`[Redis Cache DEL Error] Keys: ${keys.join(", ")}`, err);
  }
}

/**
 * Invalidate cache keys matching a pattern using non-blocking SCAN iteration.
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !pattern) return;

  try {
    let cursor = 0;
    const matchedKeys: string[] = [];
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = typeof nextCursor === "string" ? parseInt(nextCursor, 10) : Number(nextCursor);
      if (keys && keys.length > 0) {
        matchedKeys.push(...keys);
      }
    } while (cursor !== 0);

    if (matchedKeys.length > 0) {
      await redis.del(...matchedKeys);
    }
  } catch (err) {
    console.warn(`[Redis Cache DEL Pattern Error] Pattern: ${pattern}`, err);
  }
}

const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

/**
 * Acquires a non-blocking distributed lock using Redis SET NX EX.
 */
export async function acquireLock(
  lockKey: string,
  ttlSeconds: number = 10
): Promise<{ acquired: boolean; token: string | null }> {
  const redis = getRedisClient();
  if (!redis) {
    return { acquired: true, token: null };
  }

  const token = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  try {
    const result = await redis.set(lockKey, token, { nx: true, ex: ttlSeconds });
    return { acquired: result === "OK", token: result === "OK" ? token : null };
  } catch (err) {
    console.warn(`[Redis Lock Error] Key: ${lockKey}`, err);
    return { acquired: false, token: null };
  }
}

/**
 * Releases a distributed lock atomically using Lua script to verify token ownership.
 */
export async function releaseLock(lockKey: string, token: string | null): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !token) return true;

  try {
    const result = await redis.eval(RELEASE_LOCK_SCRIPT, [lockKey], [token]);
    return result === 1;
  } catch (err) {
    console.warn(`[Redis Release Lock Error] Key: ${lockKey}`, err);
    return false;
  }
}

import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }

  return redisClient;
}

/**
 * Cache helper to get or set JSON data in Redis
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const redis = getRedisClient();
  if (!redis) {
    return fetchFn();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[Redis Cache GET Error] Key: ${key}`, err);
  }

  const freshData = await fetchFn();

  try {
    if (freshData !== null && freshData !== undefined) {
      await redis.set(key, freshData, { ex: ttlSeconds });
    }
  } catch (err) {
    console.warn(`[Redis Cache SET Error] Key: ${key}`, err);
  }

  return freshData;
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

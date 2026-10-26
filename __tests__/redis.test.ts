import test from "node:test";
import assert from "node:assert/strict";
import { getOrSetCache, acquireLock, releaseLock } from "../lib/redis";

test("getOrSetCache runs fetchFn and returns result when Redis env is not configured", async () => {
  let callCount = 0;
  const result = await getOrSetCache("test:fallback", async () => {
    callCount++;
    return { data: "success" };
  });

  assert.deepEqual(result, { data: "success" });
  assert.equal(callCount, 1);
});

test("getOrSetCache deduplicates concurrent in-flight calls (singleflight)", async () => {
  let executionCount = 0;
  const slowFetch = async () => {
    executionCount++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { count: executionCount };
  };

  // Dispatch 5 concurrent requests for the exact same cache key
  const results = await Promise.all([
    getOrSetCache("test:stampede", slowFetch),
    getOrSetCache("test:stampede", slowFetch),
    getOrSetCache("test:stampede", slowFetch),
    getOrSetCache("test:stampede", slowFetch),
    getOrSetCache("test:stampede", slowFetch),
  ]);

  // Singleflight deduplication ensures the heavy fetch function runs exactly once
  assert.equal(executionCount, 1);
  for (const res of results) {
    assert.deepEqual(res, { count: 1 });
  }
});

test("acquireLock and releaseLock gracefully bypass when Redis env is not configured", async () => {
  const prevUrl = process.env.UPSTASH_REDIS_REST_URL;
  const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    const lock = await acquireLock("lock:test:slot", 5);
    assert.equal(lock.acquired, true);
    assert.equal(lock.token, null);

    const released = await releaseLock("lock:test:slot", lock.token);
    assert.equal(released, true);
  } finally {
    if (prevUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = prevUrl;
    if (prevToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = prevToken;
  }
});

import assert from "node:assert/strict";
import { courtsQuerySchema } from "../src/features/courts/schemas";

// Set environment variable to allow importing lib/prisma safely if needed
process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";

// Mock server-only so DAL/routes can be imported in Node test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

// --- Configurable Mock State ---
let rateLimitSuccess = true;
let lastRateLimitIdentifier = "";

const ratelimitPath = require.resolve("../lib/ratelimit");
require.cache[ratelimitPath] = {
  id: ratelimitPath,
  filename: ratelimitPath,
  loaded: true,
  exports: {
    checkRateLimit: async (identifier: string) => {
      lastRateLimitIdentifier = identifier;
      return { success: rateLimitSuccess };
    },
    checkRateLimitRelaxed: async (identifier: string) => {
      lastRateLimitIdentifier = identifier;
      return { success: rateLimitSuccess };
    },
  },
} as unknown as NodeModule;

let activeCourtExists = true;
const sampleAvailability = [
  { hour: 8, startTime: "08:00", endTime: "09:00", status: "FREE" },
  { hour: 9, startTime: "09:00", endTime: "10:00", status: "BOOKED" },
];
const sampleCourts = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Lapangan Futsal A",
    type: "FUTSAL",
    pricePerHour: 150000,
    imageUrl: null,
    venue: { name: "CourtGrid Arena" },
  },
];

let getAvailabilityCalled = false;
let getActiveCourtsCalled = false;

const dalPath = require.resolve("../src/features/courts/dal");
require.cache[dalPath] = {
  id: dalPath,
  filename: dalPath,
  loaded: true,
  exports: {
    checkActiveCourtExistsDAL: async () => activeCourtExists,
    getCourtAvailabilityDAL: async () => {
      getAvailabilityCalled = true;
      return sampleAvailability;
    },
    getActiveCourtsDAL: async () => {
      getActiveCourtsCalled = true;
      return sampleCourts;
    },
  },
} as unknown as NodeModule;

let cacheCalled = false;
let lastCacheKey = "";
const redisPath = require.resolve("../lib/redis");
require.cache[redisPath] = {
  id: redisPath,
  filename: redisPath,
  loaded: true,
  exports: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOrSetCache: async (key: string, fetchFn: () => any) => {
      cacheCalled = true;
      lastCacheKey = key;
      return fetchFn();
    },
    getRedisClient: () => null,
  },
} as unknown as NodeModule;

// Import GET route handler after mocks are in place
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require("../app/api/courts/route") as {
  GET: (request: Request) => Promise<Response>;
};

let passed = 0;
let failed = 0;

const tests: { name: string; fn: () => void | Promise<void> }[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

function resetMocks() {
  rateLimitSuccess = true;
  lastRateLimitIdentifier = "";
  activeCourtExists = true;
  getAvailabilityCalled = false;
  getActiveCourtsCalled = false;
  cacheCalled = false;
  lastCacheKey = "";
}

const validUuid = "123e4567-e89b-12d3-a456-426614174000";

// === Pure Schema Tests ===

test("courtsQuerySchema rejects calendar-invalid dates", () => {
  assert.equal(courtsQuerySchema.safeParse({ date: "2026-99-99" }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ date: "2026-02-30" }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ date: "2026-13-01" }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ date: "2026-00-10" }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ date: "2026-08-18" }).success, true);
});

test("courtsQuerySchema validates courtId, search length, and type enum", () => {
  assert.equal(courtsQuerySchema.safeParse({ courtId: validUuid }).success, true);
  assert.equal(courtsQuerySchema.safeParse({ courtId: "not-a-uuid" }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ search: "a".repeat(50) }).success, true);
  assert.equal(courtsQuerySchema.safeParse({ search: "a".repeat(51) }).success, false);
  assert.equal(courtsQuerySchema.safeParse({ type: "FUTSAL" }).success, true);
  assert.equal(courtsQuerySchema.safeParse({ type: "BADMINTON" }).success, true);
  assert.equal(courtsQuerySchema.safeParse({ type: "BASKETBALL" }).success, false);
});

// === Behavioral Route Tests (QA-1) ===

test("GET /api/courts?date=2026-99-99&courtId=<uuid> → 400", async () => {
  resetMocks();
  const res = await GET(
    new Request(`http://localhost:3000/api/courts?date=2026-99-99&courtId=${validUuid}`)
  );
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "Parameter tidak valid.");
});

test("GET /api/courts?date=2026-02-30&courtId=<uuid> → 400", async () => {
  resetMocks();
  const res = await GET(
    new Request(`http://localhost:3000/api/courts?date=2026-02-30&courtId=${validUuid}`)
  );
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "Parameter tidak valid.");
});

test("GET /api/courts?date=2026-08-18&courtId=<uuid> + court exists + checkRateLimit success → 200 { data } with Cache-Control: no-store", async () => {
  resetMocks();
  const res = await GET(
    new Request(`http://localhost:3000/api/courts?date=2026-08-18&courtId=${validUuid}`)
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const json = (await res.json()) as { data: typeof sampleAvailability };
  assert.deepStrictEqual(json.data, sampleAvailability);
  assert.equal(getAvailabilityCalled, true);
  assert.ok(lastRateLimitIdentifier.startsWith("public:courts:avail:"));
});

test("GET /api/courts?courtId=<uuid> (court tak ada) → 404 { error: 'Lapangan tidak ditemukan.' }", async () => {
  resetMocks();
  activeCourtExists = false;
  const res = await GET(
    new Request(`http://localhost:3000/api/courts?courtId=${validUuid}`)
  );
  assert.equal(res.status, 404);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "Lapangan tidak ditemukan.");
});

test("GET /api/courts?courtId=<uuid>&date=2026-08-18 + checkRateLimit fail → 429", async () => {
  resetMocks();
  rateLimitSuccess = false;
  const res = await GET(
    new Request(`http://localhost:3000/api/courts?courtId=${validUuid}&date=2026-08-18`)
  );
  assert.equal(res.status, 429);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "Terlalu banyak permintaan. Silakan coba lagi nanti.");
  assert.ok(lastRateLimitIdentifier.startsWith("public:courts:avail:"));
});

test("GET /api/courts?search=lapangan → 200 { data }", async () => {
  resetMocks();
  const res = await GET(
    new Request("http://localhost:3000/api/courts?search=lapangan")
  );
  assert.equal(res.status, 200);
  const json = (await res.json()) as { data: typeof sampleCourts };
  assert.deepStrictEqual(json.data, sampleCourts);
  assert.equal(cacheCalled, true);
  assert.equal(getActiveCourtsCalled, true);
  assert.equal(lastCacheKey, "public:courts:ALL:lapangan");
  assert.ok(lastRateLimitIdentifier.startsWith("public:courts:list:"));
});

test("GET /api/courts (tanpa param) → 200 { data } (cache dipanggil)", async () => {
  resetMocks();
  const res = await GET(new Request("http://localhost:3000/api/courts"));
  assert.equal(res.status, 200);
  const json = (await res.json()) as { data: typeof sampleCourts };
  assert.deepStrictEqual(json.data, sampleCourts);
  assert.equal(cacheCalled, true);
  assert.equal(getActiveCourtsCalled, true);
  assert.equal(lastCacheKey, "public:courts:ALL:none");
});

test("GET /api/courts?type=BASKETBALL → 400 (invalid enum)", async () => {
  resetMocks();
  const res = await GET(
    new Request("http://localhost:3000/api/courts?type=BASKETBALL")
  );
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "Parameter tidak valid.");
});

test("IP anti-spoofing: prefers x-real-ip over x-forwarded-for", async () => {
  resetMocks();
  await GET(
    new Request("http://localhost:3000/api/courts", {
      headers: {
        "x-real-ip": "10.0.0.1",
        "x-forwarded-for": "192.168.1.1, 10.0.0.1",
      },
    })
  );
  assert.equal(lastRateLimitIdentifier, "public:courts:list:10.0.0.1");
});

test("Rate limit bucket separation: avail bucket vs list bucket", async () => {
  resetMocks();
  await GET(
    new Request(`http://localhost:3000/api/courts?courtId=${validUuid}&date=2026-08-18`, {
      headers: { "x-real-ip": "10.0.0.5" },
    })
  );
  assert.equal(lastRateLimitIdentifier, "public:courts:avail:10.0.0.5");

  await GET(
    new Request("http://localhost:3000/api/courts", {
      headers: { "x-real-ip": "10.0.0.5" },
    })
  );
  assert.equal(lastRateLimitIdentifier, "public:courts:list:10.0.0.5");
});

// --- Runner ---
async function runAll() {
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓ ${t.name}`);
      passed++;
    } catch (e: unknown) {
      console.error(`  ✗ ${t.name}`);
      console.error(`    ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runAll();

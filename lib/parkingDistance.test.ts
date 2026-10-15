// ---------------------------------------------------------------------------
// lib/parkingDistance.test.ts
//
// Unit tests for lib/parkingDistance.ts. Run with `npm test`
// (`node --test lib/parkingDistance.test.ts`). The Supabase client is a fake
// chain object; sleep and logger are injected so the degrade retry is
// silent and instant.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchNearestParking,
  minutesFromSeconds,
  nearestParking,
  type ParkingDistanceClient,
  type ParkingDistanceQueryResult,
} from "./parkingDistance.ts";

const P1 = "11111111-1111-1111-1111-111111111111";
const P2 = "22222222-2222-2222-2222-222222222222";
const P3 = "33333333-3333-3333-3333-333333333333";

function row(parking_location_id: string, walking_seconds: number, distance_meters: number) {
  return { parking_location_id, walking_seconds, distance_meters };
}

// --- minutesFromSeconds ---------------------------------------------------

test("minutesFromSeconds rounds up (ceil)", () => {
  assert.equal(minutesFromSeconds(60), 1);
  assert.equal(minutesFromSeconds(61), 2);
  assert.equal(minutesFromSeconds(1), 1);
  assert.equal(minutesFromSeconds(599), 10);
  assert.equal(minutesFromSeconds(600), 10);
});

test("minutesFromSeconds returns 0 for zero, negative or non-finite input", () => {
  assert.equal(minutesFromSeconds(0), 0);
  assert.equal(minutesFromSeconds(-30), 0);
  assert.equal(minutesFromSeconds(Number.NaN), 0);
  assert.equal(minutesFromSeconds(Number.POSITIVE_INFINITY), 0);
});

// --- nearestParking -------------------------------------------------------

test("nearestParking picks the smallest walking_seconds", () => {
  const result = nearestParking([row(P1, 300, 400), row(P2, 120, 150), row(P3, 500, 700)]);
  assert.deepEqual(result, {
    parking_location_id: P2,
    walking_seconds: 120,
    distance_meters: 150,
    walking_minutes: 2,
  });
});

test("nearestParking breaks a walking_seconds tie by distance_meters", () => {
  const result = nearestParking([row(P1, 180, 260), row(P2, 180, 240), row(P3, 180, 250)]);
  assert.equal(result?.parking_location_id, P2);
  assert.equal(result?.distance_meters, 240);
});

test("nearestParking is deterministic on a full tie (lowest parking_location_id)", () => {
  const a = nearestParking([row(P3, 180, 240), row(P1, 180, 240), row(P2, 180, 240)]);
  const b = nearestParking([row(P2, 180, 240), row(P3, 180, 240), row(P1, 180, 240)]);
  assert.equal(a?.parking_location_id, P1);
  assert.equal(b?.parking_location_id, P1);
});

test("nearestParking returns null for an empty list", () => {
  assert.equal(nearestParking([]), null);
});

test("nearestParking ignores malformed rows and returns null when none are usable", () => {
  assert.equal(nearestParking([null, {}, { parking_location_id: P1 }, row(P2, -5, 10)]), null);
  const result = nearestParking([
    { parking_location_id: P1, walking_seconds: "90", distance_meters: 100 },
    row(P2, 95, 100),
  ]);
  assert.equal(result?.parking_location_id, P2);
});

test("nearestParking exposes walking_minutes as ceil(seconds / 60)", () => {
  assert.equal(nearestParking([row(P1, 61, 80)])?.walking_minutes, 2);
  assert.equal(nearestParking([row(P1, 0, 0)])?.walking_minutes, 0);
});

// --- fetchNearestParking --------------------------------------------------

type FakeCall = { table: string; columns: string; column: string; value: string };

/** Fake supabase chain: each call to the terminal `.eq()` pops the next outcome. */
function fakeClient(outcomes: Array<ParkingDistanceQueryResult | Error>) {
  const calls: FakeCall[] = [];
  const fake = {
    from(table: string) {
      return {
        select(columns: string) {
          return {
            eq(column: string, value: string): Promise<ParkingDistanceQueryResult> {
              calls.push({ table, columns, column, value });
              const next = outcomes.shift();
              if (next === undefined) throw new Error("fake client: no outcome queued");
              if (next instanceof Error) return Promise.reject(next);
              return Promise.resolve(next);
            },
          };
        },
      };
    },
  };
  // The real client type is supabase-js's generic builder chain; the fake
  // only implements the three calls the module makes.
  const client = fake as unknown as ParkingDistanceClient;
  return { client, calls };
}

function silent() {
  const logs: string[] = [];
  const sleeps: number[] = [];
  const opts = {
    logger: { error: (m: string) => logs.push(m) },
    sleep: async (ms: number) => {
      sleeps.push(ms);
    },
    backoffMs: 3,
  };
  return { logs, sleeps, opts };
}

test("fetchNearestParking queries by location_id and returns the nearest car park", async () => {
  const { client, calls } = fakeClient([
    { data: [row(P1, 400, 500), row(P2, 200, 260)], error: null },
  ]);
  const { opts, logs } = silent();
  const result = await fetchNearestParking(client, "loc-1", opts);
  assert.equal(result?.parking_location_id, P2);
  assert.equal(result?.walking_minutes, 4);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].table, "location_parking_distances");
  assert.equal(calls[0].column, "location_id");
  assert.equal(calls[0].value, "loc-1");
  assert.match(calls[0].columns, /parking_location_id/);
  assert.match(calls[0].columns, /walking_seconds/);
  assert.match(calls[0].columns, /distance_meters/);
  assert.deepEqual(logs, []);
});

test("fetchNearestParking returns null when the table has no rows for the location", async () => {
  const { client } = fakeClient([{ data: [], error: null }]);
  const { opts, logs } = silent();
  assert.equal(await fetchNearestParking(client, "loc-2", opts), null);
  assert.deepEqual(logs, []);
});

test("fetchNearestParking returns null (after one retry) when the table is missing", async () => {
  const missing = {
    data: null,
    error: { message: "Could not find the table 'public.location_parking_distances' in the schema cache" },
  };
  const { client, calls } = fakeClient([missing, missing]);
  const { opts, logs, sleeps } = silent();
  assert.equal(await fetchNearestParking(client, "loc-3", opts), null);
  assert.equal(calls.length, 2, "degrade retries once");
  assert.deepEqual(sleeps, [3]);
  assert.equal(logs.length, 2);
  assert.match(logs[1], /parkingDistance fetchNearestParking:loc-3: degraded to fallback after retry/);
});

test("fetchNearestParking recovers when the retry succeeds", async () => {
  const { client, calls } = fakeClient([
    new Error("TypeError: fetch failed"),
    { data: [row(P3, 59, 70)], error: null },
  ]);
  const { opts, logs } = silent();
  const result = await fetchNearestParking(client, "loc-4", opts);
  assert.equal(result?.parking_location_id, P3);
  assert.equal(result?.walking_minutes, 1);
  assert.equal(calls.length, 2);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /retrying/);
});

test("fetchNearestParking returns null without querying when the client is null", async () => {
  const { opts, logs } = silent();
  assert.equal(await fetchNearestParking(null, "loc-5", opts), null);
  assert.deepEqual(logs, []);
});

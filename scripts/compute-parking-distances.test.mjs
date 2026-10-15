// scripts/compute-parking-distances.test.mjs
//
// Unit tests for the pure helpers and the fetch-injected pipeline in
// scripts/compute-parking-distances.mjs. Run with `npm test`
// (`node --test scripts/compute-parking-distances.test.mjs`). `fetch` is
// always a local fake — Mapbox is never called from the test suite.

import test from "node:test";
import assert from "node:assert/strict";
import {
  MATRIX_MAX_COORDS,
  batchOrigins,
  buildMatrixUrl,
  computeAll,
  exportPath,
  parseArgs,
  parseMatrix,
  sqlString,
  toUpsertSql,
} from "./compute-parking-distances.mjs";

function loc(i, overrides = {}) {
  return {
    id: `loc-${String(i).padStart(4, "0")}`,
    slug: `place-${i}`,
    name: `Place ${i}`,
    latitude: 48.44 + i * 0.0001,
    longitude: 2.6 + i * 0.0001,
    ...overrides,
  };
}

function parks(n) {
  return Array.from({ length: n }, (_, i) =>
    loc(900 + i, { slug: `parking-${i}`, name: `Parking ${i}` })
  );
}

function originsList(n) {
  return Array.from({ length: n }, (_, i) => loc(i + 1));
}

/** A fully routable Matrix response: 100 s / 80 m per pair, offset by indices. */
function okMatrix(batch, parkList, mutate = () => {}) {
  const durations = batch.map((_, i) => parkList.map((_, j) => 100 + i * 10 + j));
  const distances = batch.map((_, i) => parkList.map((_, j) => 80 + i * 10 + j));
  const json = { code: "Ok", durations, distances };
  mutate(json);
  return json;
}

// --- batching ---------------------------------------------------------------

test("batchOrigins keeps every request at or under 25 coordinates with 6 car parks", () => {
  const sixParks = parks(6);
  const origins = originsList(101);
  const size = MATRIX_MAX_COORDS - sixParks.length;
  assert.equal(size, 19);
  const batches = batchOrigins(origins, size);
  assert.equal(batches.length, Math.ceil(101 / 19));
  for (const batch of batches) {
    assert.ok(batch.length >= 1);
    assert.ok(batch.length + sixParks.length <= MATRIX_MAX_COORDS);
  }
  assert.equal(batches.flat().length, 101);
  assert.deepEqual(
    batches.flat().map((o) => o.id),
    origins.map((o) => o.id),
    "order preserved, no origin lost or duplicated"
  );
});

test("batchOrigins returns one batch when everything fits", () => {
  assert.equal(batchOrigins(originsList(19), 19).length, 1);
  assert.equal(batchOrigins([], 19).length, 0);
});

test("batchOrigins refuses when the car parks alone fill the request", () => {
  assert.throws(() => batchOrigins(originsList(3), 0), /Cannot batch origins/);
  assert.throws(() => batchOrigins(originsList(3), -2), /Cannot batch origins/);
});

// --- URL ---------------------------------------------------------------------

test("buildMatrixUrl encodes lng,lat pairs, sources/destinations indices and both annotations", () => {
  const batch = originsList(2);
  const two = parks(2);
  const url = new URL(buildMatrixUrl(batch, two, "tok"));
  assert.equal(url.host, "api.mapbox.com");
  assert.ok(url.pathname.startsWith("/directions-matrix/v1/mapbox/walking/"));
  const coords = decodeURIComponent(url.pathname.split("/mapbox/walking/")[1]).split(";");
  assert.equal(coords.length, 4);
  assert.equal(coords[0], `${batch[0].longitude},${batch[0].latitude}`, "lng before lat");
  assert.equal(coords[2], `${two[0].longitude},${two[0].latitude}`);
  assert.equal(url.searchParams.get("sources"), "0;1");
  assert.equal(url.searchParams.get("destinations"), "2;3");
  assert.equal(url.searchParams.get("annotations"), "duration,distance");
  assert.equal(url.searchParams.get("access_token"), "tok");
});

test("buildMatrixUrl rejects a request over 25 coordinates", () => {
  assert.throws(() => buildMatrixUrl(originsList(20), parks(6), "tok"), /max 25/);
});

// --- parsing -----------------------------------------------------------------

test("parseMatrix maps cells to rows and rounds to whole seconds/meters", () => {
  const batch = originsList(2);
  const two = parks(2);
  const json = okMatrix(batch, two, (j) => {
    j.durations[0][0] = 123.4;
    j.distances[0][0] = 99.6;
  });
  const { rows, skipped } = parseMatrix(json, batch, two);
  assert.equal(rows.length, 4);
  assert.equal(skipped.length, 0);
  const first = rows[0];
  assert.equal(first.location_id, batch[0].id);
  assert.equal(first.parking_location_id, two[0].id);
  assert.equal(first.walking_seconds, 123);
  assert.equal(first.distance_meters, 100);
  assert.equal(first.method, "mapbox_walking");
  assert.ok(!("distance_km" in first));
});

test("parseMatrix skips unroutable (null) pairs and never fabricates a straight-line value", () => {
  const batch = originsList(3);
  const two = parks(2);
  const json = okMatrix(batch, two, (j) => {
    j.durations[1][0] = null;
    j.distances[1][0] = null;
    j.distances[2][1] = null; // only one annotation missing: still unroutable
  });
  const { rows, skipped } = parseMatrix(json, batch, two);
  assert.equal(rows.length, 4);
  assert.equal(skipped.length, 2);
  assert.deepEqual(
    skipped.map((s) => [s.location_slug, s.parking_slug]),
    [
      ["place-2", "parking-0"],
      ["place-3", "parking-1"],
    ]
  );
  for (const r of rows) {
    assert.ok(Number.isInteger(r.walking_seconds) && r.walking_seconds >= 0);
    assert.ok(Number.isInteger(r.distance_meters) && r.distance_meters >= 0);
    assert.ok(!(r.location_slug === "place-2" && r.parking_slug === "parking-0"));
  }
});

test("parseMatrix throws on a non-Ok code or a shape mismatch", () => {
  const batch = originsList(2);
  const two = parks(2);
  assert.throws(
    () => parseMatrix({ code: "InvalidInput", message: "bad" }, batch, two),
    /InvalidInput/
  );
  assert.throws(() => parseMatrix({ code: "Ok", durations: [[1, 2]], distances: [[1, 2]] }, batch, two), /do not match/);
  assert.throws(() => parseMatrix(okMatrix(batch, parks(3)), batch, two), /car parks/);
});

// --- SQL ---------------------------------------------------------------------

test("sqlString doubles single quotes", () => {
  assert.equal(sqlString("l'esquisse"), "'l''esquisse'");
  assert.equal(sqlString("plain"), "'plain'");
});

test("toUpsertSql escapes names/slugs, resolves ids by slug and upserts on the unique key", () => {
  const rows = [
    {
      location_id: "a",
      location_slug: "l'esquisse",
      location_name: "L'Esquisse\nsecond line",
      parking_location_id: "b",
      parking_slug: "parking-de-l'eglise",
      parking_name: "Parking de l'Église",
      walking_seconds: 245,
      distance_meters: 310,
      method: "mapbox_walking",
    },
  ];
  const sql = toUpsertSql(rows, { generatedAt: new Date("2026-10-15T00:00:00Z") });
  assert.match(sql, /insert into public\.location_parking_distances/);
  assert.match(sql, /'l''esquisse'/);
  assert.match(sql, /'parking-de-l''eglise'/);
  assert.match(sql, /on conflict \(location_id, parking_location_id\) do update/);
  assert.match(sql, /join public\.locations l on l\.slug = v\.location_slug/);
  assert.match(sql, /join public\.locations p on p\.slug = v\.parking_slug/);
  assert.match(sql, /245, 310, 'mapbox_walking'/);
  assert.match(sql, /distance_meters/);
  assert.doesNotMatch(sql, /distance_km/);
  assert.doesNotMatch(sql, /'a'|'b'/, "no hardcoded UUIDs as literals");
  // The name comment is one line and the SQL still parses as one statement.
  assert.match(sql, /-- L'Esquisse second line -> Parking de l'Église/);
  assert.equal((sql.match(/;\s*$/g) ?? []).length, 1);
  // No lone quote outside comments: every quote in literals is paired after
  // escaping, so the statement body has an even number of quotes.
  const body = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
  assert.equal((body.match(/'/g) ?? []).length % 2, 0);
  const literals = body.match(/'(?:[^']|'')*'/g) ?? [];
  assert.deepEqual(literals, ["'l''esquisse'", "'parking-de-l''eglise'", "'mapbox_walking'"]);
});

test("toUpsertSql with no rows emits only a comment header", () => {
  const sql = toUpsertSql([]);
  assert.match(sql, /nothing to upsert/);
  assert.doesNotMatch(sql, /insert into/);
});

test("exportPath is exports/parking-distances-<date>.sql", () => {
  assert.equal(exportPath(new Date("2026-10-15T23:59:00Z")), "exports/parking-distances-2026-10-15.sql");
});

// --- pipeline with injected fetch -------------------------------------------

test("computeAll issues one Matrix request per batch, merges rows and lists skipped pairs", async () => {
  const sixParks = parks(6);
  const origins = originsList(40); // 19 + 19 + 2 -> 3 requests
  const urls = [];
  const fakeFetch = async (url) => {
    urls.push(url);
    const u = new URL(url);
    const n = u.searchParams.get("sources").split(";").length;
    const batch = origins.slice(urls.length * 19 - 19, urls.length * 19 - 19 + n);
    const json = okMatrix(batch, sixParks, (j) => {
      if (urls.length === 1) {
        j.durations[0][0] = null; // first origin cannot reach parking-0
      }
    });
    return { ok: true, status: 200, json: async () => json };
  };
  const result = await computeAll(origins, sixParks, "tok", fakeFetch);
  assert.equal(result.requests, 3);
  assert.equal(urls.length, 3);
  for (const url of urls) {
    const coords = decodeURIComponent(new URL(url).pathname.split("/mapbox/walking/")[1]).split(";");
    assert.ok(coords.length <= MATRIX_MAX_COORDS);
  }
  assert.equal(result.rows.length, 40 * 6 - 1);
  assert.equal(result.skipped.length, 1);
  assert.deepEqual(result.failed, []);
  assert.equal(result.skipped[0].location_slug, "place-1");
  assert.equal(result.skipped[0].parking_slug, "parking-0");
  // No row ever carries a value for the skipped pair.
  assert.ok(
    !result.rows.some((r) => r.location_slug === "place-1" && r.parking_slug === "parking-0")
  );
});

test("computeAll records a failed batch (HTTP error) and continues with the rest", async () => {
  const twoParks = parks(2);
  const origins = originsList(30); // 23 + 7 -> 2 requests
  let call = 0;
  const fakeFetch = async (url) => {
    call += 1;
    if (call === 1) return { ok: false, status: 429, json: async () => ({}) };
    const n = new URL(url).searchParams.get("sources").split(";").length;
    const batch = origins.slice(23, 23 + n);
    return { ok: true, status: 200, json: async () => okMatrix(batch, twoParks) };
  };
  const result = await computeAll(origins, twoParks, "tok", fakeFetch);
  assert.equal(result.requests, 2);
  assert.equal(result.failed.length, 1);
  assert.match(result.failed[0].error, /HTTP 429/);
  assert.equal(result.failed[0].origins.length, 23);
  assert.equal(result.rows.length, 7 * 2);
});

// --- CLI ---------------------------------------------------------------------

test("parseArgs defaults to dry-run and rejects conflicting flags", () => {
  assert.deepEqual(parseArgs([]), { mode: "dry-run" });
  assert.deepEqual(parseArgs(["--dry-run"]), { mode: "dry-run" });
  assert.deepEqual(parseArgs(["--execute"]), { mode: "execute" });
  assert.throws(() => parseArgs(["--dry-run", "--execute"]), /mutually exclusive/);
});

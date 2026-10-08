import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  WALKING_ROUTE_MAX_STOPS,
  buildDirectionsUrl,
  createRouteScheduler,
  fetchWalkingRoute,
  formatDuration,
  parseDirectionsResponse,
  routeKey,
  walkingRoutePrecheck,
  type LngLat,
  type WalkingRouteResult,
} from "./walkingRoute.ts";
import { MY_DAY_MAX_STOPS } from "./myDay.ts";

const NBSP = " ";
const TOKEN = "pk.test";
const A: LngLat = [2.6065, 48.4455];
const B: LngLat = [2.61, 48.45];
const C: LngLat = [2.62, 48.46];

function nCoords(n: number): LngLat[] {
  return Array.from({ length: n }, (_, i) => [2.6 + i * 0.001, 48.44 + i * 0.001]);
}

function okBody(legs: number, lineCoords = 5) {
  return {
    code: "Ok",
    routes: [
      {
        distance: 999, // deliberately not the leg sum — totals must come from legs
        duration: 999,
        legs: Array.from({ length: legs }, (_, i) => ({
          distance: 100 * (i + 1),
          duration: 60 * (i + 1),
        })),
        geometry: {
          type: "LineString",
          coordinates: Array.from({ length: lineCoords }, (_, i) => [
            2.6 + i * 0.001,
            48.44 + i * 0.001,
          ]),
        },
      },
    ],
  };
}

// 1. parity
test("WALKING_ROUTE_MAX_STOPS equals MY_DAY_MAX_STOPS", () => {
  assert.equal(WALKING_ROUTE_MAX_STOPS, MY_DAY_MAX_STOPS);
  assert.equal(WALKING_ROUTE_MAX_STOPS, 10);
});

// 2. routeKey
test("routeKey: empty under 2 coords, 6-decimal, order-sensitive", () => {
  assert.equal(routeKey([]), "");
  assert.equal(routeKey([A]), "");
  assert.equal(routeKey([A, B]), "2.606500,48.445500;2.610000,48.450000");
  assert.notEqual(routeKey([A, B]), routeKey([B, A]));
  assert.equal(routeKey([A, B]), routeKey([[2.6065, 48.4455], [2.61, 48.45]]));
});

// 3. precheck
test("walkingRoutePrecheck: counts first, then token", () => {
  assert.equal(walkingRoutePrecheck(0, TOKEN), "too-few-stops");
  assert.equal(walkingRoutePrecheck(1, TOKEN), "too-few-stops");
  assert.equal(walkingRoutePrecheck(2, TOKEN), null);
  assert.equal(walkingRoutePrecheck(10, TOKEN), null);
  assert.equal(walkingRoutePrecheck(11, TOKEN), "too-many-stops");
  assert.equal(walkingRoutePrecheck(2, ""), "no-token");
  assert.equal(walkingRoutePrecheck(2, undefined), "no-token");
  assert.equal(walkingRoutePrecheck(11, ""), "too-many-stops");
});

// 4. URL
test("buildDirectionsUrl: exact shape, coordinates-only path, cap enforced", () => {
  assert.equal(
    buildDirectionsUrl([A, B], TOKEN),
    "https://api.mapbox.com/directions/v5/mapbox/walking/2.606500,48.445500;2.610000,48.450000?geometries=geojson&overview=full&steps=false&alternatives=false&access_token=pk.test"
  );
  const ten = buildDirectionsUrl(nCoords(10), TOKEN);
  const tenPath = ten.slice(
    "https://api.mapbox.com/directions/v5/mapbox/walking/".length,
    ten.indexOf("?")
  );
  assert.equal(tenPath.split(";").length - 1, 9);
  assert.match(tenPath, /^[0-9.,;-]+$/);
  assert.throws(() => buildDirectionsUrl(nCoords(11), TOKEN), RangeError);
  assert.throws(() => buildDirectionsUrl([A], TOKEN), RangeError);
  assert.throws(() => buildDirectionsUrl([A, B], ""), RangeError);
  assert.ok(!ten.includes("language"));
  assert.ok(!ten.includes("walking_speed"));
});

// 5. parse happy path
test("parseDirectionsResponse: legs mapped, totals are leg sums, geometry passed", () => {
  const body = okBody(2);
  const r = parseDirectionsResponse(body, 2);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(r.route.legs, [
    { distanceMeters: 100, durationSeconds: 60 },
    { distanceMeters: 200, durationSeconds: 120 },
  ]);
  assert.equal(r.route.totalMeters, 300);
  assert.equal(r.route.totalSeconds, 180);
  assert.deepEqual(r.route.geometry, body.routes[0].geometry);
  assert.equal(r.route.geometry.coordinates.length, 5);
});

// 6. no-route
test("parseDirectionsResponse: NoRoute / NoSegment → no-route", () => {
  assert.deepEqual(parseDirectionsResponse({ code: "NoRoute", routes: [] }, 2), {
    ok: false,
    reason: "no-route",
  });
  assert.deepEqual(parseDirectionsResponse({ code: "NoSegment" }, 2), {
    ok: false,
    reason: "no-route",
  });
});

// 7. malformed
test("parseDirectionsResponse: every malformed shape → malformed", () => {
  const malformed = { ok: false, reason: "malformed" };
  const cases: unknown[] = [
    null,
    "str",
    {},
    { code: "Ok" },
    { code: "Ok", routes: [] },
    okBody(1),
    okBody(3),
    { code: "Weird", routes: [] },
  ];
  for (const c of cases) {
    assert.deepEqual(parseDirectionsResponse(c, 2), malformed, JSON.stringify(c));
  }
  const nanLeg = okBody(2);
  nanLeg.routes[0].legs[0].distance = NaN;
  assert.deepEqual(parseDirectionsResponse(nanLeg, 2), malformed);

  const strLeg: Record<string, unknown> = okBody(2);
  (strLeg.routes as Array<{ legs: Array<Record<string, unknown>> }>)[0].legs[1].duration = "5";
  assert.deepEqual(parseDirectionsResponse(strLeg, 2), malformed);

  const point: Record<string, unknown> = okBody(2);
  (point.routes as Array<Record<string, unknown>>)[0].geometry = {
    type: "Point",
    coordinates: [2.6, 48.44],
  };
  assert.deepEqual(parseDirectionsResponse(point, 2), malformed);

  assert.deepEqual(parseDirectionsResponse(okBody(2, 1), 2), malformed);

  const polyline: Record<string, unknown> = okBody(2);
  (polyline.routes as Array<Record<string, unknown>>)[0].geometry = "abc_polyline";
  assert.deepEqual(parseDirectionsResponse(polyline, 2), malformed);
});

// 8. fetchWalkingRoute with stub
type StubResponse = { ok: boolean; status: number; json(): Promise<unknown> };
function makeStub(
  behaviour: (url: string, init: { method: "GET"; signal: AbortSignal }) => Promise<StubResponse>
) {
  const calls: Array<{ url: string; init: { method: "GET"; signal: AbortSignal } }> = [];
  const fn = (url: string, init: { method: "GET"; signal: AbortSignal }) => {
    calls.push({ url, init });
    return behaviour(url, init);
  };
  return { fn, calls };
}

test("fetchWalkingRoute: success, http statuses, network, aborted, bad json, prechecks", async () => {
  const sig = new AbortController().signal;

  const okStub = makeStub(async () => ({ ok: true, status: 200, json: async () => okBody(1) }));
  const ok = await fetchWalkingRoute([A, B], TOKEN, sig, okStub.fn);
  assert.ok(ok.ok);
  assert.equal(okStub.calls.length, 1);
  assert.equal(okStub.calls[0].url, buildDirectionsUrl([A, B], TOKEN));
  assert.equal(okStub.calls[0].init.signal, sig);
  assert.equal(okStub.calls[0].init.method, "GET");

  for (const status of [401, 403, 422, 429, 500]) {
    let jsonCalled = false;
    const stub = makeStub(async () => ({
      ok: false,
      status,
      json: async () => {
        jsonCalled = true;
        return {};
      },
    }));
    const r = await fetchWalkingRoute([A, B], TOKEN, sig, stub.fn);
    assert.deepEqual(r, { ok: false, reason: "http", status });
    assert.equal(jsonCalled, false);
  }

  const netStub = makeStub(async () => {
    throw new TypeError("Failed to fetch");
  });
  assert.deepEqual(await fetchWalkingRoute([A, B], TOKEN, sig, netStub.fn), {
    ok: false,
    reason: "network",
  });

  const ac = new AbortController();
  ac.abort();
  const abortStub = makeStub(async () => {
    throw new DOMException("aborted", "AbortError");
  });
  assert.deepEqual(await fetchWalkingRoute([A, B], TOKEN, ac.signal, abortStub.fn), {
    ok: false,
    reason: "aborted",
  });

  const badJson = makeStub(async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError("bad json");
    },
  }));
  assert.deepEqual(await fetchWalkingRoute([A, B], TOKEN, sig, badJson.fn), {
    ok: false,
    reason: "malformed",
  });

  const never = makeStub(async () => ({ ok: true, status: 200, json: async () => okBody(1) }));
  assert.deepEqual(await fetchWalkingRoute(nCoords(11), TOKEN, sig, never.fn), {
    ok: false,
    reason: "too-many-stops",
  });
  assert.deepEqual(await fetchWalkingRoute([A], TOKEN, sig, never.fn), {
    ok: false,
    reason: "too-few-stops",
  });
  assert.deepEqual(await fetchWalkingRoute([A, B], "", sig, never.fn), {
    ok: false,
    reason: "no-token",
  });
  assert.equal(never.calls.length, 0);

  // 10 coords → exactly one request with 10 pairs
  const tenStub = makeStub(async () => ({ ok: true, status: 200, json: async () => okBody(9) }));
  const ten = await fetchWalkingRoute(nCoords(10), TOKEN, sig, tenStub.fn);
  assert.ok(ten.ok);
  assert.equal(tenStub.calls.length, 1);
  assert.equal(tenStub.calls[0].url.split(";").length, 10);
});

// 9. scheduler
const flush = () => new Promise<void>((r) => setImmediate(r));

test("createRouteScheduler: debounce collapses bursts to one request", async (t) => {
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => mock.timers.reset());
  const fetched: string[] = [];
  const results: Array<[string, WalkingRouteResult]> = [];
  const fetcher = async (coords: readonly LngLat[]) => {
    fetched.push(routeKey(coords));
    return { ok: true, route: okRoute() } as WalkingRouteResult;
  };
  const s = createRouteScheduler(fetcher, (k, r) => results.push([k, r]));
  s.request("k1", [A, B]);
  s.request("k2", [B, A]);
  s.request("k3", [A, C]);
  assert.equal(fetched.length, 0);
  mock.timers.tick(400);
  await flush();
  assert.equal(fetched.length, 1);
  assert.equal(fetched[0], routeKey([A, C]));
  assert.equal(results.length, 1);
  assert.equal(results[0][0], "k3");
  assert.ok(results[0][1].ok);
});

test("createRouteScheduler: a new request aborts in-flight and drops its late result", async (t) => {
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => mock.timers.reset());
  const signals: AbortSignal[] = [];
  const resolvers: Array<(r: WalkingRouteResult) => void> = [];
  const fetcher = (_c: readonly LngLat[], signal: AbortSignal) =>
    new Promise<WalkingRouteResult>((resolve) => {
      signals.push(signal);
      resolvers.push(resolve);
    });
  const results: Array<[string, WalkingRouteResult]> = [];
  const s = createRouteScheduler(fetcher, (k, r) => results.push([k, r]));
  s.request("k1", [A, B]);
  mock.timers.tick(400);
  await flush();
  assert.equal(signals.length, 1);
  s.request("k2", [B, C]);
  assert.equal(signals[0].aborted, true);
  mock.timers.tick(400);
  await flush();
  assert.equal(signals.length, 2);
  resolvers[0]({ ok: true, route: okRoute() }); // late k1
  resolvers[1]({ ok: true, route: okRoute() });
  await flush();
  assert.equal(results.length, 1);
  assert.equal(results[0][0], "k2");
});

test("createRouteScheduler: timeout aborts and reports timeout", async (t) => {
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => mock.timers.reset());
  let seen: AbortSignal | null = null;
  const fetcher = (_c: readonly LngLat[], signal: AbortSignal) =>
    new Promise<WalkingRouteResult>(() => {
      seen = signal;
    });
  const results: Array<[string, WalkingRouteResult]> = [];
  const s = createRouteScheduler(fetcher, (k, r) => results.push([k, r]));
  s.request("k1", [A, B]);
  mock.timers.tick(400);
  await flush();
  assert.ok(seen !== null);
  mock.timers.tick(8000);
  await flush();
  assert.deepEqual(results, [["k1", { ok: false, reason: "timeout" }]]);
  assert.equal((seen as unknown as AbortSignal).aborted, true);
});

test("createRouteScheduler: cancel before fire → fetcher never called", async (t) => {
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => mock.timers.reset());
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return { ok: true, route: okRoute() } as WalkingRouteResult;
  };
  const results: unknown[] = [];
  const s = createRouteScheduler(fetcher, (k, r) => results.push([k, r]));
  s.request("k1", [A, B]);
  s.cancel();
  mock.timers.tick(400);
  await flush();
  assert.equal(calls, 0);
  assert.equal(results.length, 0);
});

test("createRouteScheduler: fetcher rejection → network", async (t) => {
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => mock.timers.reset());
  const fetcher = async () => {
    throw new Error("boom");
  };
  const results: Array<[string, WalkingRouteResult]> = [];
  const s = createRouteScheduler(fetcher, (k, r) => results.push([k, r]));
  s.request("k1", [A, B]);
  mock.timers.tick(400);
  await flush();
  assert.deepEqual(results, [["k1", { ok: false, reason: "network" }]]);
});

function okRoute() {
  return {
    legs: [{ distanceMeters: 100, durationSeconds: 60 }],
    totalMeters: 100,
    totalSeconds: 60,
    geometry: { type: "LineString" as const, coordinates: [A, B] },
  };
}

// 10. formatDuration
test("formatDuration: minutes, hours, FR/EN forms with NBSP", () => {
  assert.equal(formatDuration(0, "fr"), `1${NBSP}min`);
  assert.equal(formatDuration(29, "fr"), `1${NBSP}min`);
  assert.equal(formatDuration(90, "fr"), `2${NBSP}min`);
  assert.equal(formatDuration(720, "fr"), `12${NBSP}min`);
  assert.equal(formatDuration(3570, "fr"), `1${NBSP}h`);
  assert.equal(formatDuration(3900, "fr"), `1${NBSP}h${NBSP}05`);
  assert.equal(formatDuration(3900, "en"), `1${NBSP}h${NBSP}05${NBSP}min`);
  assert.equal(formatDuration(7200, "en"), `2${NBSP}h`);
  assert.equal(formatDuration(5400, "en"), `1${NBSP}h${NBSP}30${NBSP}min`);
  assert.ok(!formatDuration(3900, "fr").includes(" "));
});

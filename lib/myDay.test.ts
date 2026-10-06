import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeSlugs,
  parseDayParam,
  buildDayParam,
  haversineMeters,
  totalMeters,
  suggestOrder,
  moveItem,
  formatDistance,
  MY_DAY_MAX_STOPS,
} from "./myDay.ts";

test("sanitizeSlugs rejects non-arrays and bad entries", () => {
  assert.deepEqual(sanitizeSlugs(null), []);
  assert.deepEqual(sanitizeSlugs("a,b"), []);
  assert.deepEqual(sanitizeSlugs({}), []);
  assert.deepEqual(sanitizeSlugs([1, null, "Upper", "bad slug", "", "a--b", "ok-1"]), ["ok-1"]);
});

test("sanitizeSlugs dedupes keep-first and caps at max", () => {
  assert.deepEqual(sanitizeSlugs(["a", "b", "a", "c"]), ["a", "b", "c"]);
  const many = Array.from({ length: 15 }, (_, i) => `s${i}`);
  assert.equal(sanitizeSlugs(many).length, MY_DAY_MAX_STOPS);
});

test("parseDayParam handles comma, %2C, arrays, empty", () => {
  assert.deepEqual(parseDayParam("a,b,c"), ["a", "b", "c"]);
  assert.deepEqual(parseDayParam("a%2Cb"), ["a", "b"]);
  assert.deepEqual(parseDayParam(["a,b", "c"]), ["a", "b"]);
  assert.deepEqual(parseDayParam(""), []);
  assert.deepEqual(parseDayParam(undefined), []);
  assert.deepEqual(parseDayParam("a,BAD SLUG,b"), ["a", "b"]);
  assert.equal(buildDayParam(["a", "b"]), "a,b");
});

test("haversineMeters known pair within 1%", () => {
  // Paris (48.8566, 2.3522) to Lyon (45.7640, 4.8357): ~392 km
  const d = haversineMeters(
    { latitude: 48.8566, longitude: 2.3522 },
    { latitude: 45.764, longitude: 4.8357 }
  );
  assert.ok(Math.abs(d - 392000) / 392000 < 0.01, `got ${d}`);
  assert.equal(haversineMeters({ latitude: 1, longitude: 1 }, { latitude: 1, longitude: 1 }), 0);
});

test("suggestOrder keeps first and never increases total", () => {
  const stops = [
    { id: "a", latitude: 48.44, longitude: 2.6 },
    { id: "b", latitude: 48.46, longitude: 2.62 },
    { id: "c", latitude: 48.441, longitude: 2.601 },
    { id: "d", latitude: 48.45, longitude: 2.61 },
  ];
  const out = suggestOrder(stops);
  assert.equal(out[0].id, "a");
  assert.equal(out.length, stops.length);
  assert.ok(totalMeters(out) <= totalMeters(stops));
  const two = stops.slice(0, 2);
  assert.deepEqual(suggestOrder(two), two);
});

test("moveItem", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b"], 0, 5), ["a", "b"]);
});

test("formatDistance FR/EN", () => {
  assert.equal(formatDistance(347, "fr"), "350 m");
  assert.equal(formatDistance(1234, "fr"), "1,2 km");
  assert.equal(formatDistance(1234, "en"), "1.2 km");
  assert.equal(formatDistance(999, "en"), "1.0 km");
});

// scripts/upload-media.test.mjs
// node --test over the pure helpers exported by upload-media.mjs. Zero
// credentials required — importing the module must not construct any
// client or validate env vars (main() is guarded behind the
// process.argv[1] === fileURLToPath(import.meta.url) check).

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseDisplayOrder,
  computeFolderOrders,
  r2KeyFor,
  urlFor,
} from "./upload-media.mjs";

// ---------------------------------------------------------------------------
// parseDisplayOrder
// ---------------------------------------------------------------------------

test("parseDisplayOrder: bare slug ending in digits -> 0 (the maison-45 landmine)", () => {
  assert.equal(parseDisplayOrder("maison-45", "maison-45"), 0);
});

test("parseDisplayOrder: bare slug -> 0", () => {
  assert.equal(parseDisplayOrder("auberge-ganne", "auberge-ganne"), 0);
});

test("parseDisplayOrder: slug-1 -> 1", () => {
  assert.equal(parseDisplayOrder("auberge-ganne-1", "auberge-ganne"), 1);
});

test("parseDisplayOrder: slug-01 (zero-padded) -> 1", () => {
  assert.equal(parseDisplayOrder("auberge-ganne-01", "auberge-ganne"), 1);
});

test("parseDisplayOrder: slug-2 / slug-02 -> 2", () => {
  assert.equal(parseDisplayOrder("auberge-ganne-2", "auberge-ganne"), 2);
  assert.equal(parseDisplayOrder("auberge-ganne-02", "auberge-ganne"), 2);
});

test("parseDisplayOrder: unrecognized name throws", () => {
  assert.throws(() => parseDisplayOrder("some-random-name", "auberge-ganne"));
});

test("parseDisplayOrder: non-numeric suffix throws (not silently coerced)", () => {
  assert.throws(() => parseDisplayOrder("auberge-ganne-front", "auberge-ganne"));
});

test("parseDisplayOrder: unrelated file sharing a prefix throws", () => {
  assert.throws(() => parseDisplayOrder("auberge-ganne-annexe-1", "auberge-ganne"));
});

// ---------------------------------------------------------------------------
// computeFolderOrders (duplicate-order rejection)
// ---------------------------------------------------------------------------

test("computeFolderOrders: valid folder maps each basename to its order", () => {
  const orders = computeFolderOrders("auberge-ganne", ["auberge-ganne-1", "auberge-ganne-2"]);
  assert.equal(orders.get("auberge-ganne-1"), 1);
  assert.equal(orders.get("auberge-ganne-2"), 2);
});

test("computeFolderOrders: bare file alone maps to 0", () => {
  const orders = computeFolderOrders("maison-45", ["maison-45"]);
  assert.equal(orders.get("maison-45"), 0);
});

test("computeFolderOrders: duplicate display_order (x-1 and x-01 both -> 1) rejected", () => {
  assert.throws(
    () => computeFolderOrders("auberge-ganne", ["auberge-ganne-1", "auberge-ganne-01"]),
    /Duplicate display_order/
  );
});

test("computeFolderOrders: propagates an unrecognized-name error", () => {
  assert.throws(() => computeFolderOrders("auberge-ganne", ["auberge-ganne-1", "unrelated-file"]));
});

// ---------------------------------------------------------------------------
// urlFor
// ---------------------------------------------------------------------------

test("urlFor: strips a trailing slash from the base URL", () => {
  assert.equal(
    urlFor("https://media.explorebarbizon.com/", "locations/x/x-1600.webp"),
    "https://media.explorebarbizon.com/locations/x/x-1600.webp"
  );
});

test("urlFor: base URL without a trailing slash is unaffected", () => {
  assert.equal(
    urlFor("https://media.explorebarbizon.com", "general/y-800.webp"),
    "https://media.explorebarbizon.com/general/y-800.webp"
  );
});

// ---------------------------------------------------------------------------
// r2KeyFor
// ---------------------------------------------------------------------------

test("r2KeyFor: location path", () => {
  assert.equal(
    r2KeyFor("locations/auberge-ganne", "auberge-ganne-1", 1600),
    "locations/auberge-ganne/auberge-ganne-1-1600.webp"
  );
});

test("r2KeyFor: location path, bare basename, 800w", () => {
  assert.equal(
    r2KeyFor("locations/maison-45", "maison-45", 800),
    "locations/maison-45/maison-45-800.webp"
  );
});

test("r2KeyFor: _general/site-asset path", () => {
  assert.equal(
    r2KeyFor("general", "grande-rue-ambiance-01", 800),
    "general/grande-rue-ambiance-01-800.webp"
  );
});

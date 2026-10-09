// ---------------------------------------------------------------------------
// lib/referrerHost.test.ts
//
// Unit tests for extractReferrerHost (lib/referrerHost.ts): hostname-only
// output, own-domain discard, and rejection of malformed or oversized input.
// Run with `npm test`.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { extractReferrerHost } from "./referrerHost.ts";

const OWN = "explorebarbizon.com";

test("external https referrer yields hostname only", () => {
  assert.equal(
    extractReferrerHost("https://www.google.com/search?q=barbizon#x", OWN),
    "www.google.com"
  );
});

test("http referrer is accepted", () => {
  assert.equal(extractReferrerHost("http://example.org/a", OWN), "example.org");
});

test("own host exact match is discarded", () => {
  assert.equal(extractReferrerHost("https://explorebarbizon.com/fr", OWN), null);
});

test("ownHost with port is normalised", () => {
  assert.equal(
    extractReferrerHost("http://localhost:3000/x", "localhost:3000"),
    null
  );
  assert.equal(
    extractReferrerHost("https://explorebarbizon.com/", "EXPLOREBARBIZON.com:443"),
    null
  );
});

test("subdomain of own host is discarded", () => {
  assert.equal(extractReferrerHost("https://www.explorebarbizon.com/", OWN), null);
});

test("lookalike host is not discarded", () => {
  assert.equal(
    extractReferrerHost("https://notexplorebarbizon.com/", OWN),
    "notexplorebarbizon.com"
  );
});

test("non-string input returns null", () => {
  assert.equal(extractReferrerHost(undefined, OWN), null);
  assert.equal(extractReferrerHost(null, OWN), null);
  assert.equal(extractReferrerHost(42, OWN), null);
  assert.equal(extractReferrerHost({}, OWN), null);
});

test("empty string returns null", () => {
  assert.equal(extractReferrerHost("", OWN), null);
});

test("oversized string returns null", () => {
  const big = "https://example.com/" + "a".repeat(2048);
  assert.equal(extractReferrerHost(big, OWN), null);
});

test("javascript: URL returns null", () => {
  assert.equal(extractReferrerHost("javascript:alert(1)", OWN), null);
});

test("malformed URL returns null", () => {
  assert.equal(extractReferrerHost("not a url", OWN), null);
});

test("trailing dot is stripped", () => {
  assert.equal(extractReferrerHost("https://example.com./x", OWN), "example.com");
});

test("uppercase hostname is lowercased", () => {
  assert.equal(extractReferrerHost("https://EXAMPLE.Com/X", OWN), "example.com");
});

test("missing ownHost does not discard", () => {
  assert.equal(extractReferrerHost("https://example.com/", undefined), "example.com");
});

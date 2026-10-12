// Unit tests for the product event name validation (lib/productEvents.ts).
import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_EVENTS, isProductEvent } from "./productEvents.ts";

test("the four My day event names are accepted", () => {
  assert.deepEqual([...PRODUCT_EVENTS], [
    "myday_add",
    "myday_share_created",
    "myday_shared_opened",
    "myday_shared_saved",
  ]);
  for (const name of PRODUCT_EVENTS) assert.equal(isProductEvent(name), true);
});

test("unknown, malformed and non-string values are rejected", () => {
  for (const v of ["", "myday_add ", "MYDAY_ADD", "page_view", "myday_add?x=1", null, undefined, 1, {}, ["myday_add"]]) {
    assert.equal(isProductEvent(v), false);
  }
});

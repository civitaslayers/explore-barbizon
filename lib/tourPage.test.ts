// ---------------------------------------------------------------------------
// lib/tourPage.test.ts
//
// Unit tests for localizeTour() and toTourListItem() (lib/tourPage.ts). Run
// with `npm test` (`node --test lib/tourPage.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  localizeTour,
  toTourListItem,
  type TourInput,
  type TourStopInput,
} from "./tourPage.ts";

type StopWithLocationId = TourStopInput & { location_id: string };

function baseStops(): StopWithLocationId[] {
  return [
    {
      location_id: "loc-1",
      stop_order: 1,
      stop_narrative: "Narratif FR",
      translations: null,
      locations: {
        slug: "auberge-ganne",
        name: "Auberge Ganne",
        short_description: "Ancienne auberge des peintres.",
        latitude: 48.44,
        longitude: 2.6,
        translations: {
          en: {
            short_description: "Former inn of the painters.",
            _meta: { status: "published" },
          },
        },
      },
    },
    {
      location_id: "loc-2",
      stop_order: 2,
      stop_narrative: "Deuxième arrêt",
      translations: null,
      locations: {
        slug: "maison-millet",
        name: "Maison Millet",
        short_description: null,
        latitude: 48.45,
        longitude: 2.61,
        translations: {
          en: {
            name: "DRAFT Millet House",
            short_description: "DRAFT studio",
            _meta: { status: "draft" },
          },
        },
      },
    },
    {
      location_id: "loc-3",
      stop_order: 3,
      stop_narrative: null,
      translations: null,
      locations: null,
    },
  ];
}

type TestTour = TourInput & { stops: StopWithLocationId[] };

const tourNullTranslations: TestTour = {
  slug: "circuit-des-peintres",
  name: "Parcours des Mosaïques",
  description: "A walking trail through the village.",
  duration_minutes: 120,
  distance_meters: 3200,
  translations: null,
  stops: baseStops(),
};

function withPublishedEn(): TestTour {
  const stops = baseStops();
  stops[0] = {
    ...stops[0],
    translations: {
      en: { stop_narrative: "English narrative", _meta: { status: "published" } },
    },
  };
  return {
    ...tourNullTranslations,
    translations: {
      en: {
        name: "Mosaics Trail",
        description: "An English description",
        _meta: { status: "published" },
      },
    },
    stops,
  };
}

const tourPublishedEn: TestTour = withPublishedEn();

const tourDraftEn: TestTour = {
  ...tourNullTranslations,
  translations: {
    en: {
      name: "DRAFT Mosaics Trail",
      description: "DRAFT description",
      _meta: { status: "draft" },
    },
  },
  stops: baseStops(),
};

test("en + null translations → base name/description (today's live data)", () => {
  const view = localizeTour(tourNullTranslations, "en");
  assert.equal(view.name, "Parcours des Mosaïques");
  assert.equal(view.description, "A walking trail through the village.");
});

test("en + published translations → English name/description and stop narrative", () => {
  const view = localizeTour(tourPublishedEn, "en");
  assert.equal(view.name, "Mosaics Trail");
  assert.equal(view.description, "An English description");
  assert.equal(view.stops[0].stop_narrative, "English narrative");
  assert.equal(view.stops[1].stop_narrative, "Deuxième arrêt");
});

test("en + draft translations → base values", () => {
  const view = localizeTour(tourDraftEn, "en");
  assert.equal(view.name, "Parcours des Mosaïques");
  assert.equal(view.description, "A walking trail through the village.");
});

test("fr + published translations → base values everywhere", () => {
  const view = localizeTour(tourPublishedEn, "fr");
  assert.equal(view.name, "Parcours des Mosaïques");
  assert.equal(view.description, "A walking trail through the village.");
  assert.equal(view.stops[0].stop_narrative, "Narratif FR");
  assert.equal(
    view.stops[0].locations?.short_description,
    "Ancienne auberge des peintres."
  );
  assert.equal(view.stops[0].locations?.name, "Auberge Ganne");
});

test("stop with published en location → English short_description, base name", () => {
  const view = localizeTour(tourNullTranslations, "en");
  const loc = view.stops[0].locations;
  assert.ok(loc);
  assert.equal(loc.short_description, "Former inn of the painters.");
  assert.equal(loc.name, "Auberge Ganne");
  assert.equal(loc.slug, "auberge-ganne");
  assert.equal(loc.latitude, 48.44);
  assert.equal(loc.longitude, 2.6);
});

test("stop with draft en and null base short_description → null (not ''), base name", () => {
  const view = localizeTour(tourNullTranslations, "en");
  const loc = view.stops[1].locations;
  assert.ok(loc);
  assert.equal(loc.short_description, null);
  assert.equal(loc.name, "Maison Millet");
});

test("stop with null locations → null locations and null narrative, no throw", () => {
  const view = localizeTour(tourNullTranslations, "en");
  assert.equal(view.stops[2].locations, null);
  assert.equal(view.stops[2].stop_narrative, null);
});

test("null tour description → null in the view", () => {
  const view = localizeTour(
    { ...tourNullTranslations, description: null },
    "en"
  );
  assert.equal(view.description, null);
});

test("stop order and count preserved; empty stops → []", () => {
  const view = localizeTour(tourPublishedEn, "en");
  assert.deepEqual(
    view.stops.map((s) => s.stop_order),
    [1, 2, 3]
  );
  const reversed = localizeTour(
    { ...tourNullTranslations, stops: [...baseStops()].reverse() },
    "en"
  );
  assert.deepEqual(
    reversed.stops.map((s) => s.stop_order),
    [3, 2, 1]
  );
  const empty = localizeTour({ ...tourNullTranslations, stops: [] }, "en");
  assert.deepEqual(empty.stops, []);
});

test("shape: view / stop / location keys are exact; no translations anywhere", () => {
  const view = localizeTour(tourPublishedEn, "en");
  assert.deepEqual(Object.keys(view).sort(), [
    "description",
    "distance_meters",
    "duration_minutes",
    "name",
    "slug",
    "stops",
  ]);
  for (const stop of view.stops) {
    assert.deepEqual(Object.keys(stop).sort(), [
      "locations",
      "stop_narrative",
      "stop_order",
    ]);
    if (stop.locations) {
      assert.deepEqual(Object.keys(stop.locations).sort(), [
        "latitude",
        "longitude",
        "name",
        "short_description",
        "slug",
      ]);
    }
  }
  const serialized = JSON.stringify(view);
  assert.ok(!serialized.includes('"translations"'));
  assert.ok(!serialized.includes('"location_id"'));
  assert.ok(!serialized.includes('"tour_id"'));
  assert.ok(!("translations" in JSON.parse(serialized)));
});

test("toTourListItem: localized title/summary, duration rounding, stops as location ids, exact keys", () => {
  const en = toTourListItem(tourPublishedEn, "en");
  assert.equal(en.title, "Mosaics Trail");
  assert.equal(en.summary, "An English description");
  assert.deepEqual(en.stops, ["loc-1", "loc-2", "loc-3"]);
  assert.equal(en.durationHours, 2);
  assert.deepEqual(Object.keys(en).sort(), [
    "durationHours",
    "slug",
    "stops",
    "summary",
    "title",
  ]);

  const fr = toTourListItem(tourPublishedEn, "fr");
  assert.equal(fr.title, "Parcours des Mosaïques");

  const nullDesc = toTourListItem(
    { ...tourNullTranslations, description: null },
    "en"
  );
  assert.equal(nullDesc.summary, "");

  const nullDuration = toTourListItem(
    { ...tourNullTranslations, duration_minutes: null },
    "en"
  );
  assert.equal(nullDuration.durationHours, 2);

  const ninety = toTourListItem(
    { ...tourNullTranslations, duration_minutes: 90 },
    "en"
  );
  assert.equal(ninety.durationHours, 2);
});

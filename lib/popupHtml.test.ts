// ---------------------------------------------------------------------------
// lib/popupHtml.test.ts
//
// Unit tests for the Mapbox popup HTML builders (lib/popupHtml.ts): every
// interpolated database/i18n value must be escaped in both text and attribute
// context, and ordinary text must stay byte-identical to the previous inline
// templates in components/MapGL.tsx.
// Run with `npm test` (`node --test lib/popupHtml.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  escapeHtml,
  buildPinPopupContent,
  buildTrailPopupContent,
  type PinPopupInput,
  type TrailPopupInput,
} from "./popupHtml.ts";

const HOSTILE = `<img src=x onerror="alert(1)"> & "q"`;
const HOSTILE_ESCAPED = `&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &quot;q&quot;`;

const PIN_BASE: PinPopupInput = {
  slug: "auberge-ganne",
  category: "Museum",
  categorySlug: "museum",
  categoryLabels: { museum: "Musée" },
  name: "Auberge Ganne",
  shortDescription: "Le musée.",
  href: "/en/places/auberge-ganne",
  viewPlaceLabel: "View place",
};

const TRAIL_BASE: TrailPopupInput = {
  name: "Sentier bleu",
  description: "Une boucle en forêt.",
  distanceMeters: 4500,
  durationMinutes: 90,
  difficulty: "moderate",
  startLat: 48.4,
  startLng: 2.6,
  trailEyebrow: "Trail",
  difficultyLabel: "Moderate",
  loopLabel: "Loop",
};

function count(haystack: string, re: RegExp): number {
  return (haystack.match(re) ?? []).length;
}

test("1. escapeHtml escapes & < > \" and leaves everything else untouched", () => {
  assert.equal(escapeHtml(HOSTILE), HOSTILE_ESCAPED);
  const plain = "Maison d'artiste → · … Café !";
  assert.equal(escapeHtml(plain), plain);
});

test("2. pin popup: hostile name is escaped in the <h3>", () => {
  const html = buildPinPopupContent({ ...PIN_BASE, name: HOSTILE });
  assert.ok(html.includes(HOSTILE_ESCAPED));
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes('onerror="'));
  const h3 = html.match(/<h3[^>]*>([^<]*)<\/h3>/);
  assert.ok(h3, "h3 present");
  assert.equal(h3[1], HOSTILE_ESCAPED);
});

test("3. pin popup: hostile shortDescription and categoryEyebrow are escaped", () => {
  // Eyebrow via label-map miss -> raw category.
  const viaCategory = buildPinPopupContent({
    ...PIN_BASE,
    categoryLabels: {},
    category: HOSTILE,
    shortDescription: HOSTILE,
  });
  assert.ok(viaCategory.includes(HOSTILE_ESCAPED));
  assert.ok(!viaCategory.includes("<img"));
  assert.ok(!viaCategory.includes('onerror="'));
  assert.equal(count(viaCategory, /<p/g), 2);

  // Eyebrow via a hostile label-map value.
  const viaLabel = buildPinPopupContent({
    ...PIN_BASE,
    categoryLabels: { museum: HOSTILE },
    shortDescription: HOSTILE,
  });
  assert.ok(viaLabel.includes(HOSTILE_ESCAPED));
  assert.ok(!viaLabel.includes("<img"));
  assert.ok(!viaLabel.includes('onerror="'));
  assert.equal(count(viaLabel, /<p/g), 2);
});

test("4. pin popup: attribute contexts (slug, href) cannot break out of the quotes", () => {
  const html = buildPinPopupContent({
    ...PIN_BASE,
    slug: 'a" onmouseover="x',
    href: '/places/a" onmouseover="x',
  });
  assert.ok(html.includes('data-day-toggle="a&quot; onmouseover=&quot;x"'));
  assert.ok(html.includes('href="/places/a&quot; onmouseover=&quot;x"'));
  // The payload survives as inert text inside the quoted value
  // (`onmouseover=&quot;x`), so the property to assert is that no real
  // attribute was created: `onmouseover="` with an actual quote never appears.
  assert.ok(!/\sonmouseover="/.test(html));
});

test("5. pin popup: ordinary text is byte-identical to the old inline template", () => {
  const html = buildPinPopupContent(PIN_BASE);
  assert.ok(html.includes(">View place →</a>"));
  assert.ok(html.includes("Auberge Ganne</h3>"));
  assert.ok(html.includes(">Musée</p>"));
  assert.ok(html.includes(">Le musée.</p>"));
  assert.ok(!html.includes("&amp;"));
  assert.ok(!html.includes("&lt;"));
  assert.ok(html.includes("margin:0 0 7px"));

  const noDesc = buildPinPopupContent({ ...PIN_BASE, shortDescription: null });
  assert.equal(count(noDesc, /<p/g), 1);
  assert.ok(noDesc.includes("margin:0 0 10px;line-height:1.3"));

  const noHref = buildPinPopupContent({ ...PIN_BASE, href: null });
  assert.ok(!noHref.includes("<a "));
});

test("6. pin popup: exactly one [data-day-toggle] button", () => {
  assert.equal(count(buildPinPopupContent(PIN_BASE), /data-day-toggle="/g), 1);
  assert.equal(
    count(
      buildPinPopupContent({
        ...PIN_BASE,
        name: HOSTILE,
        shortDescription: HOSTILE,
        slug: HOSTILE,
      }),
      /data-day-toggle="/g
    ),
    1
  );
});

test("7. trail popup: hostile name + description escaped; truncate-then-escape", () => {
  const html = buildTrailPopupContent({
    ...TRAIL_BASE,
    name: HOSTILE,
    description: HOSTILE,
  });
  assert.ok(html.includes(HOSTILE_ESCAPED));
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes('onerror="'));
  const descP = html.match(/<p style="font-size:11px;color:rgba\(17,17,17,0\.6\)[^>]*>([^<]*)<\/p>/);
  assert.ok(descP, "description <p> present");
  assert.ok(descP[0].endsWith("…</p>"));

  // 119 x's + "&" + 80 y's: the cut at 120 chars lands exactly after the
  // "&", so the entity is produced whole and no "y" survives.
  const long = "x".repeat(119) + "&" + "y".repeat(80);
  const longHtml = buildTrailPopupContent({ ...TRAIL_BASE, description: long });
  assert.ok(longHtml.includes("x&amp;…</p>"));
  const longDescP = longHtml.match(/<p style="font-size:11px;color:rgba\(17,17,17,0\.6\)[^>]*>([^<]*)<\/p>/);
  assert.ok(longDescP, "description <p> present");
  assert.ok(!longDescP[1].includes("y"));
});

test("8. trail popup: numeric/empty fields render ? placeholders and formatted durations", () => {
  const empty = buildTrailPopupContent({
    ...TRAIL_BASE,
    distanceMeters: null,
    durationMinutes: null,
    description: null,
  });
  assert.ok(empty.includes("? km · ? · Loop"));
  assert.ok(!empty.includes("line-height:1.5\""));
  assert.equal(count(empty, /<p/g), 2);

  const typical = buildTrailPopupContent(TRAIL_BASE);
  assert.ok(typical.includes("4.5 km · 1h30m · Loop"));

  const exact = buildTrailPopupContent({ ...TRAIL_BASE, durationMinutes: 120 });
  assert.ok(exact.includes(" · 2h · "));
});

test("9. trail popup: Maps hrefs are entity-serialized (& -> &amp;)", () => {
  const html = buildTrailPopupContent(TRAIL_BASE);
  assert.ok(html.includes('href="https://maps.apple.com/?daddr=48.4,2.6&amp;dirflg=w"'));
  assert.ok(
    html.includes(
      'href="https://www.google.com/maps/dir/?api=1&amp;destination=48.4,2.6&amp;travelmode=walking"'
    )
  );
});

test("10. FR labels with accents/NBSP are byte-identical; hostile label still followed by literal arrow", () => {
  const trail = buildTrailPopupContent({
    ...TRAIL_BASE,
    trailEyebrow: "Sentier",
    difficultyLabel: "Modéré",
    loopLabel: "Boucle",
  });
  assert.ok(trail.includes(">Sentier · Modéré</p>"));
  assert.ok(trail.includes("4.5 km · 1h30m · Boucle</p>"));

  const pin = buildPinPopupContent({ ...PIN_BASE, viewPlaceLabel: "Voir le lieu" });
  assert.ok(pin.includes(">Voir le lieu →</a>"));

  const nbsp = buildPinPopupContent({ ...PIN_BASE, viewPlaceLabel: "Voir !" });
  assert.ok(nbsp.includes(">Voir ! →</a>"));

  const hostileLabel = buildPinPopupContent({ ...PIN_BASE, viewPlaceLabel: "<b>x</b>" });
  assert.ok(hostileLabel.includes(">&lt;b&gt;x&lt;/b&gt; →</a>"));
  assert.ok(!hostileLabel.includes("<b>"));
});

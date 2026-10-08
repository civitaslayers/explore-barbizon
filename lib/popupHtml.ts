// ---------------------------------------------------------------------------
// lib/popupHtml.ts
//
// Pure HTML builders for Mapbox popups (components/MapGL.tsx). Kept free of
// mapbox-gl/React so `node --test` can import them. Every interpolated value
// passes through escapeHtml; literals (→ · … inline styles) are written
// directly in the template and must never be passed through escapeHtml.
// ---------------------------------------------------------------------------

// Escapes & < > " only. `'` is deliberately not escaped: this is safe only
// because every attribute in these builders is double-quoted.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type PinPopupInput = {
  slug: string;
  category: string;
  // categories.slug and the parent's localized label map (lib/categoryLabel.ts).
  categorySlug: string;
  categoryLabels: Record<string, string>;
  name: string;
  shortDescription: string | null | undefined;
  href: string | null;
  viewPlaceLabel: string;
};

// Shared by the pin-click popup and the ?location focus popup. Appends the
// "Add to my day" toggle (wired after .addTo(map) by attachDayToggle).
export function buildPinPopupContent(p: PinPopupInput): string {
  // categories.slug -> localized label; falls back to the raw category name.
  const categoryEyebrow = p.categoryLabels[p.categorySlug] || p.category;
  return (
    `<div style="font-family:system-ui,sans-serif;padding:2px 0">` +
    `<p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(17,17,17,0.4);margin:0 0 5px">${escapeHtml(categoryEyebrow)}</p>` +
    `<h3 style="font-family:Georgia,serif;font-size:15px;font-weight:400;color:#111;margin:0 0 ${p.shortDescription ? "7px" : "10px"};line-height:1.3">${escapeHtml(p.name)}</h3>` +
    (p.shortDescription
      ? `<p style="font-size:11px;color:rgba(17,17,17,0.6);margin:0 0 10px;line-height:1.55">${escapeHtml(p.shortDescription)}</p>`
      : "") +
    (p.href
      ? `<a href="${escapeHtml(p.href)}" style="font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#7A5C3E;text-decoration:none">${escapeHtml(p.viewPlaceLabel)} →</a>`
      : "") +
    `<button type="button" data-day-toggle="${escapeHtml(p.slug)}" style="display:block;width:100%;height:34px;margin-top:10px;border:0;border-radius:999px;background:#111111;color:#F5F1E8;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.18em;cursor:pointer"></button>` +
    `</div>`
  );
}

export type TrailPopupInput = {
  name: string;
  description: string | null | undefined;
  distanceMeters: number | null | undefined;
  durationMinutes: number | null | undefined;
  difficulty: string | null | undefined;
  startLat: number;
  startLng: number;
  // Labels already resolved by the caller (MapGL's labelsRef).
  trailEyebrow: string;
  difficultyLabel: string;
  loopLabel: string;
};

// Trail (route-line) click popup with Apple/Google Maps walking directions.
export function buildTrailPopupContent(p: TrailPopupInput): string {
  const km = p.distanceMeters ? (p.distanceMeters / 1000).toFixed(1) : "?";
  const hrs = p.durationMinutes
    ? Math.floor(p.durationMinutes / 60) + "h" +
      (p.durationMinutes % 60 ? (p.durationMinutes % 60) + "m" : "")
    : "?";
  const mapsUrl = `https://maps.apple.com/?daddr=${p.startLat},${p.startLng}&dirflg=w`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.startLat},${p.startLng}&travelmode=walking`;
  return (
    `<div style="font-family:system-ui,sans-serif;padding:2px 0">` +
    `<p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(17,17,17,0.4);margin:0 0 5px">${escapeHtml(p.trailEyebrow)} · ${escapeHtml(p.difficultyLabel)}</p>` +
    `<h3 style="font-family:Georgia,serif;font-size:15px;font-weight:400;color:#111;margin:0 0 6px;line-height:1.3">${escapeHtml(p.name)}</h3>` +
    `<p style="font-size:11px;color:rgba(17,17,17,0.55);margin:0 0 8px">${escapeHtml(km)} km · ${escapeHtml(hrs)} · ${escapeHtml(p.loopLabel)}</p>` +
    (p.description
      // Truncate first, then escape: an entity must never be cut in half.
      ? `<p style="font-size:11px;color:rgba(17,17,17,0.6);margin:0 0 12px;line-height:1.5">${escapeHtml(p.description.substring(0, 120))}…</p>`
      : "") +
    `<div style="display:flex;gap:6px">` +
    `<a href="${escapeHtml(mapsUrl)}" target="_blank" style="flex:1;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#F5F1E8;background:#4A5E3A;padding:7px 10px;border-radius:20px;text-decoration:none;text-align:center">Apple Maps</a>` +
    `<a href="${escapeHtml(gmapsUrl)}" target="_blank" style="flex:1;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#F5F1E8;background:#4A5E3A;padding:7px 10px;border-radius:20px;text-decoration:none;text-align:center">Google Maps</a>` +
    `</div>` +
    `</div>`
  );
}

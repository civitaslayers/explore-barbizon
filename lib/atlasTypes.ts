// Shared client-facing shape for the Atlas index (map + list + preview card).
// Kept in lib/ (not imported from a pages/ file) so components can depend on
// it without pulling a page module into their bundle graph.
import type { GroupName } from "@/lib/categoryGroups";
import type { CompletenessResult } from "@/lib/completeness";

export type AtlasLocation = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  showOnMap: boolean;
  showInEditorial: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  // Needed by AtlasMapView to reconstruct the drag/proximity-override flow
  // verbatim from pins.tsx (AdminPin.allowOverride) — not in the plan's
  // Section 1.2 field list, added because the map extraction (Section 1.4)
  // explicitly requires it. See implementer report.
  allowProximityOverride: boolean;
  categoryName: string;
  layer: string;
  group: GroupName;
  color: string;
  photoUrl: string | null;
  mediaCount: number;
  updatedAt: string | null;
  completeness: CompletenessResult;
  // Phase 2 (§2.1 card quick-edit) — the index GSSP row already selects
  // these three columns for the completeness rollup but did not previously
  // serialize them to the client prop. Added so LocationPreviewCard can
  // inline-edit them without a second fetch.
  phone: string | null;
  website: string | null;
  openingHours: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// La Fiche (Phase 2) — full editable record shape + supporting types.
// Colocated with AtlasLocation per docs/ccc-v3-phase2-implementation-plan.md
// item 4. `place_id` is legacy and is never included here (fiche-plan §0).
// ---------------------------------------------------------------------------

export type FicheLocation = {
  id: string;
  slug: string;
  name: string;
  townId: string | null;
  categoryId: string | null;
  categoryName: string;
  layer: string;
  group: GroupName;
  shortDescription: string | null;
  fullDescription: string | null;
  narrative: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  bookingUrl: string | null;
  openingHours: Record<string, unknown> | null;
  latitude: number;
  longitude: number;
  allowProximityOverride: boolean;
  isPublished: boolean;
  showOnMap: boolean;
  showInEditorial: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  curationOrder: number | null;
  qrCodeUrl: string | null;
  internalNotes: string | null;
  media: { url: string; caption: string | null; displayOrder: number | null }[];
  // Rollup inputs for live completeness (NOT an editable entity block in
  // Phase 2 — location_functions display/editing is Phase 3, fiche-plan §3.10).
  functionWebsite: boolean;
  functionPhone: boolean;
  functionHours: boolean;
};

export type FicheCategoryOption = { id: string; name: string; layer: string };

export type LocationEditRow = {
  id: string;
  field: string;
  before_value: string | null;
  after_value: string | null;
  source_page: string | null;
  created_at: string;
};

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
};

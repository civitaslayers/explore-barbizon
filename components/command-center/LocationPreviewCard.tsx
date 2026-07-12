import type { AtlasLocation } from "@/lib/atlasTypes";
import { CompletenessBadge } from "@/components/command-center/CompletenessBadge";

// ---------------------------------------------------------------------------
// Shared read-mostly summary card — docs/ccc-v3-fiche-plan.md Section 2.
// Rendered by the Atlas index over either the map or the list view when
// `?sel=` is set. "Ouvrir la fiche" is disabled in Phase 1 — the fiche route
// (/command-center/atlas/[id]) does not exist until Phase 2; a live link
// here would be a real operator trap on a live-write tool.
// ---------------------------------------------------------------------------

export function LocationPreviewCard({
  location,
  onClose,
  onCenter,
}: {
  location: AtlasLocation;
  onClose: () => void;
  onCenter?: () => void;
}) {
  return (
    <div className="card shadow-card fixed bottom-8 left-4 z-30 w-80 overflow-hidden p-0">
      {/* Photo / honest empty slot */}
      <div className="relative h-36 w-full bg-surface-container-low">
        {location.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={location.photoUrl}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-ink/30">
              — sans photo —
            </span>
          </div>
        )}
        <span
          aria-hidden
          className="absolute left-3 top-3 inline-block h-2 w-2 rounded-full shadow-sm"
          style={{ backgroundColor: location.color }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/40 text-sm leading-none text-cream transition-colors hover:bg-ink/60"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <p className="heading-lg truncate">{location.name}</p>
          {location.isPublished ? (
            <span className="shrink-0 rounded-full bg-primary-container px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cream">
              Publié
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-secondary-container px-3 py-1 text-[10px] tracking-[0.06em] text-on-secondary-container">
              Brouillon
            </span>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="chip">{location.categoryName}</span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-ink/35">
            {location.showOnMap ? "carte" : "hors carte"} ·{" "}
            {location.showInEditorial ? "éditorial" : "hors éditorial"}
          </span>
        </div>

        <p className="mb-2 text-xs leading-snug text-ink/70">
          {location.address ? (
            location.address
          ) : (
            <span className="italic text-ink/35">— sans adresse —</span>
          )}
        </p>

        <p className="mb-3 line-clamp-2 text-xs leading-snug text-ink/60">
          {location.shortDescription ? (
            location.shortDescription
          ) : (
            <span className="italic text-ink/35">— sans description —</span>
          )}
        </p>

        <div className="mb-3 flex items-center justify-between">
          <CompletenessBadge
            score={location.completeness.score}
            band={location.completeness.band}
            showLabel
          />
          <p className="font-mono text-[10px] text-ink/40">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-disabled="true"
            title="Fiche — Phase 2"
            className="btn btn-secondary flex-1 cursor-not-allowed opacity-45"
          >
            Ouvrir la fiche →
          </button>
          {onCenter ? (
            <button
              type="button"
              onClick={onCenter}
              className="btn btn-secondary"
            >
              Centrer
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

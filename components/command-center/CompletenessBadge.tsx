import type { Band } from "@/lib/completeness";

// Band -> existing design tokens only (docs/design-direction.md, Section 4.4
// of docs/ccc-v3-fiche-plan.md). This is a to-do meter, not an error state —
// no red anywhere.
const BAND_RING: Record<Band, string> = {
  low: "#7A5C3E", // umber
  mid: "#444840", // on-surface-variant
  high: "#5F6F52", // moss
  complete: "#5F6F52", // moss (solid)
};

const BAND_TRACK: Record<Band, string> = {
  low: "rgba(122, 92, 62, 0.15)",
  mid: "rgba(68, 72, 64, 0.12)",
  high: "rgba(95, 111, 82, 0.15)",
  complete: "rgba(95, 111, 82, 0.15)",
};

const BAND_TEXT: Record<Band, string> = {
  low: "text-umber",
  mid: "text-on-surface-variant",
  high: "text-moss",
  complete: "text-moss",
};

export const BAND_LABEL_FR: Record<Band, string> = {
  low: "à compléter",
  mid: "en cours",
  high: "presque complète",
  complete: "complète",
};

type Size = "sm" | "md";

const DIMENSIONS: Record<Size, { box: number; inset: number; font: string }> = {
  sm: { box: 22, inset: 2, font: "text-[8px]" },
  md: { box: 36, inset: 3, font: "text-[10px]" },
};

/**
 * Small ring showing a completeness percentage, tinted by band. Pure CSS
 * conic-gradient — no charting library, per the no-new-deps constraint.
 */
export function CompletenessRing({
  score,
  band,
  size = "md",
}: {
  score: number;
  band: Band;
  size?: Size;
}) {
  const { box, inset, font } = DIMENSIONS[size];
  const degrees = Math.max(0, Math.min(100, score)) * 3.6;

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: box,
        height: box,
        background: `conic-gradient(${BAND_RING[band]} ${degrees}deg, ${BAND_TRACK[band]} 0deg)`,
      }}
      role="img"
      aria-label={`Complétude ${score}%`}
    >
      <div
        className="absolute rounded-full bg-cream flex items-center justify-center"
        style={{ inset }}
      >
        <span className={`font-sans font-semibold ${font} ${BAND_TEXT[band]}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

/**
 * Ring + optional band label, e.g. "82 — presque complète". Shared by the
 * list column and the preview card.
 */
export function CompletenessBadge({
  score,
  band,
  size = "md",
  showLabel = false,
}: {
  score: number;
  band: Band;
  size?: Size;
  showLabel?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <CompletenessRing score={score} band={band} size={size} />
      {showLabel ? (
        <span
          className={`text-[10px] uppercase tracking-[0.1em] whitespace-nowrap ${BAND_TEXT[band]}`}
        >
          {BAND_LABEL_FR[band]}
        </span>
      ) : null}
    </div>
  );
}

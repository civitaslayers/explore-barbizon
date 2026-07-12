import { useMemo, useState } from "react";
import type { MissingField, Band } from "@/lib/completeness";
import type { AtlasLocation } from "@/lib/atlasTypes";
import { CompletenessBadge } from "@/components/command-center/CompletenessBadge";

// ---------------------------------------------------------------------------
// Absorbed from pages/dashboard/locations/index.tsx, re-parented to the
// Atlas dataset + shared ?sel= selection, plus a completeness column and the
// band/missing-field filters that turn the atlas into a photo-sprint
// worklist (docs/ccc-v3-fiche-plan.md Section 4.4, Feature 1).
// ---------------------------------------------------------------------------

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const abs = Math.abs(diffSec);
  const sign = diffSec > 0 ? -1 : 1;
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (abs < 60) return rtf.format(sign * abs, "second");
  if (abs < 3600) return rtf.format(sign * Math.floor(abs / 60), "minute");
  if (abs < 86400) return rtf.format(sign * Math.floor(abs / 3600), "hour");
  if (abs < 604800) return rtf.format(sign * Math.floor(abs / 86400), "day");
  if (abs < 2592000) return rtf.format(sign * Math.floor(abs / 604800), "week");
  if (abs < 31536000) return rtf.format(sign * Math.floor(abs / 2592000), "month");
  return rtf.format(sign * Math.floor(abs / 31536000), "year");
}

function LayerChip({ layer }: { layer: string }) {
  if (layer === "Art & History") {
    return (
      <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cream bg-umber">
        {layer}
      </span>
    );
  }
  if (layer === "Eat, Stay & Shop") {
    return (
      <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cream bg-moss">
        {layer}
      </span>
    );
  }
  if (layer === "Forest & Nature") {
    return (
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cream"
        style={{ backgroundColor: "#4A5E3A" }}
      >
        {layer}
      </span>
    );
  }
  if (layer === "Practical") {
    return (
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cream"
        style={{ backgroundColor: "#888888" }}
      >
        {layer}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] bg-surface-variant text-on-surface-variant">
      {layer}
    </span>
  );
}

function Tick({ on }: { on: boolean }) {
  return <span className="text-on-surface-variant/70">{on ? "✓" : "—"}</span>;
}

const BAND_FILTERS: { key: Band | "all"; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "low", label: `À compléter (<40)` },
  { key: "mid", label: `En cours (40–79)` },
  { key: "high", label: `Presque (≥80)` },
  { key: "complete", label: "Complètes" },
];

const MISSING_CHIPS: { key: MissingField; label: string }[] = [
  { key: "photo", label: "sans photo" },
  { key: "hours", label: "sans horaires" },
  { key: "address", label: "sans adresse" },
  { key: "description", label: "sans description" },
];

type SortMode = "completeness" | "layer";

export function AtlasListView({
  locations,
  selectedId,
  onSelect,
  onHoverRow,
}: {
  locations: AtlasLocation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHoverRow?: (id: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [bandFilter, setBandFilter] = useState<Band | "all">("all");
  const [missingFilters, setMissingFilters] = useState<Set<MissingField>>(
    () => new Set()
  );
  const [sortMode, setSortMode] = useState<SortMode>("completeness");

  const toggleMissing = (field: MissingField) => {
    setMissingFilters((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let filtered = locations.filter((loc) => {
      const matchesName = needle === "" || loc.name.toLowerCase().includes(needle);
      const matchesBand = bandFilter === "all" || loc.completeness.band === bandFilter;
      const matchesMissing =
        missingFilters.size === 0 ||
        Array.from(missingFilters).every((f) => loc.completeness.missing.includes(f));
      return matchesName && matchesBand && matchesMissing;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortMode === "completeness") {
        return a.completeness.score - b.completeness.score;
      }
      if (a.layer === b.layer) return a.categoryName.localeCompare(b.categoryName);
      return a.layer.localeCompare(b.layer);
    });

    return filtered;
  }, [locations, query, bandFilter, missingFilters, sortMode]);

  return (
    <div className="max-w-content mx-auto">
      <p className="eyebrow mb-2">Atlas</p>
      <h1 className="heading-lg mb-6">Liste — {locations.length} fiches</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom…"
          className="w-full max-w-xs rounded-full bg-ink/5 px-4 py-2 text-sm text-ink placeholder:text-ink/35 outline-none focus:bg-ink/10 transition-colors duration-200 ease-soft"
        />
        <button
          type="button"
          onClick={() =>
            setSortMode((m) => (m === "completeness" ? "layer" : "completeness"))
          }
          className="chip whitespace-nowrap"
        >
          Tri : {sortMode === "completeness" ? "complétude ↑" : "catégorie"}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {BAND_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setBandFilter(key)}
            className={`chip transition-opacity duration-200 ease-soft ${
              bandFilter === key ? "opacity-100" : "opacity-40 hover:opacity-70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MISSING_CHIPS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleMissing(key)}
            className={`chip transition-opacity duration-200 ease-soft ${
              missingFilters.has(key) ? "opacity-100" : "opacity-40 hover:opacity-70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card bg-surface-container-low">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead>
            <tr className="bg-surface-container-lowest">
              <th className="px-3 py-2 font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Nom
              </th>
              <th className="px-3 py-2 font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Catégorie
              </th>
              <th className="px-3 py-2 font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Layer
              </th>
              <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Complétude
              </th>
              <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Publié
              </th>
              <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Éditorial
              </th>
              <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Vedette
              </th>
              <th className="px-3 py-2 font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Mis à jour
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row.id)}
                  onMouseEnter={() => onHoverRow?.(row.id)}
                  onMouseLeave={() => onHoverRow?.(null)}
                  className={`cursor-pointer transition-colors duration-200 ease-soft ${
                    isSelected ? "bg-surface-variant" : "hover:bg-surface-container-lowest"
                  }`}
                >
                  <td className="px-3 py-2 text-ink">{row.name}</td>
                  <td className="px-3 py-2 text-on-surface-variant">
                    {row.categoryName}
                  </td>
                  <td className="px-3 py-2">
                    <LayerChip layer={row.layer} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center">
                      <CompletenessBadge
                        score={row.completeness.score}
                        band={row.completeness.band}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Tick on={row.isPublished} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Tick on={row.showInEditorial} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Tick on={row.isFeatured} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-on-surface-variant">
                    {formatRelative(row.updatedAt)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-ink/40"
                >
                  Aucune fiche ne correspond à ces filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-ink/35">
        {rows.length} / {locations.length} fiches affichées
      </p>
    </div>
  );
}

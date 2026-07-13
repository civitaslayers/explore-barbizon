import { useEffect, useState } from "react";
import type { LocationEditRow } from "@/lib/atlasTypes";
import { FicheSection } from "./shared";

// docs/ccc-v3-fiche-plan.md Feature 4 — collapsible "Historique" panel.
// Reads GET /api/locations/[id]/edits, which itself degrades to `{ edits:
// [] }` when `location_edits` doesn't exist yet (migration not run) — so
// this panel is always safe to render, pre- or post-migration.
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function EditHistoryPanel({
  locationId,
  refreshSignal,
}: {
  locationId: string;
  /** Bump this (e.g. after a successful Save) to trigger a re-fetch. */
  refreshSignal: number;
}) {
  const [open, setOpen] = useState(false);
  const [edits, setEdits] = useState<LocationEditRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations/${locationId}/edits`);
        const data = await res.json();
        if (cancelled) return;
        setEdits(Array.isArray(data?.edits) ? data.edits : []);
      } catch {
        if (!cancelled) setEdits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // refreshSignal intentionally triggers a re-fetch while the panel is open
    // (e.g. right after a Save) — see fiche page.
  }, [open, locationId, refreshSignal]);

  return (
    <FicheSection title="Historique" tone="lowest">
      <button
        type="button"
        className="chip"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Masquer" : "Afficher"} l&apos;historique
      </button>

      {open ? (
        loading ? (
          <p className="text-xs text-ink/40">Chargement…</p>
        ) : !edits || edits.length === 0 ? (
          <p className="text-xs italic text-ink/40">Aucun historique.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {edits.map((edit) => (
              <div
                key={edit.id}
                className="rounded-lg bg-cream px-3 py-2 text-xs text-ink/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{edit.field}</span>
                  <span className="text-[10px] text-ink/40">
                    {formatDate(edit.created_at)}
                  </span>
                </div>
                <p className="mt-1 truncate">
                  <span className="text-ink/40">
                    {edit.before_value ?? "—"}
                  </span>{" "}
                  →{" "}
                  <span className="text-ink">
                    {edit.after_value ?? "—"}
                  </span>
                </p>
                {edit.source_page ? (
                  <p className="mt-0.5 text-[10px] text-ink/35">
                    {edit.source_page}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )
      ) : null}
    </FicheSection>
  );
}

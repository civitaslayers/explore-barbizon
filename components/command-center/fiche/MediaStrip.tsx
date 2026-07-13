import { FicheSection } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.7 — read-only in v3. No upload / reorder /
// delete (waits for the photo-sprint pipeline, locked decision 4). Empty
// slots are shown honestly, not hidden.
export function MediaStrip({
  media,
}: {
  media: { url: string; caption: string | null; displayOrder: number | null }[];
}) {
  const ordered = [...media].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  return (
    <FicheSection title="Médias" tone="lowest">
      {ordered.length === 0 ? (
        <p className="rounded-card bg-surface-container-low px-4 py-6 text-center text-xs italic text-ink/40">
          Aucune image — en attente du sprint photo
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {ordered.map((m, i) => (
            <div key={`${m.url}-${i}`} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.caption ?? ""}
                className="h-24 w-full rounded-lg object-cover"
              />
              {m.caption ? (
                <p className="truncate text-[10px] text-ink/50" title={m.caption}>
                  {m.caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </FicheSection>
  );
}

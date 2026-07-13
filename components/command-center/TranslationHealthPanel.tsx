// ---------------------------------------------------------------------------
// components/command-center/TranslationHealthPanel.tsx
//
// Read-only CCC panel over `v_translation_health` (docs/schema-reference.md,
// "View — v_translation_health"). Published rows only. French labels — the
// panel itself has no serverSideTranslations wiring (CCC stays French-only,
// docs/i18n-seo-implementation-plan.md CCC exclusion). No writes, no edit
// affordances.
// ---------------------------------------------------------------------------

export type EnStatus = "missing" | "stale" | "draft" | "current";

export type TranslationHealthCounts = Record<EnStatus, number>;

export type TranslationHealthSummary = {
  entityType: string;
  counts: TranslationHealthCounts;
};

const ENTITY_LABEL_FR: Record<string, string> = {
  locations: "Lieux",
  stories: "Histoires",
  tours: "Circuits",
  routes: "Itinéraires",
  tour_stops: "Étapes de circuit",
  location_functions: "Services associés",
  categories: "Catégories",
};

const STATUS_LABEL_FR: Record<EnStatus, string> = {
  missing: "manquantes",
  stale: "obsolètes",
  draft: "brouillons",
  current: "à jour",
};

function total(counts: TranslationHealthCounts): number {
  return counts.missing + counts.stale + counts.draft + counts.current;
}

export function TranslationHealthPanel({
  summaries,
}: {
  summaries: TranslationHealthSummary[];
}) {
  const grandTotal = summaries.reduce(
    (sum, s) => sum + total(s.counts),
    0
  );
  const grandMissing = summaries.reduce(
    (sum, s) => sum + s.counts.missing,
    0
  );

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <p className="eyebrow">Traductions</p>
        <p className="text-[11px] text-ink/40">
          Anglais — {grandMissing} manquantes sur {grandTotal}
        </p>
      </div>
      <div className="border border-ink/10 rounded-lg overflow-hidden">
        {summaries.length === 0 ? (
          <p className="text-sm text-ink/35 px-4 py-6 text-center">
            Aucune entité publiée trouvée.
          </p>
        ) : (
          summaries.map((s, i) => {
            const label = ENTITY_LABEL_FR[s.entityType] ?? s.entityType;
            return (
              <div
                key={s.entityType}
                className={`px-4 py-3 ${i > 0 ? "border-t border-ink/8" : ""}`}
              >
                <p className="text-sm text-ink">{label}</p>
                <p className="mt-0.5 text-[11px] text-ink/50">
                  {(Object.keys(STATUS_LABEL_FR) as EnStatus[])
                    .map(
                      (status) =>
                        `${s.counts[status]} ${STATUS_LABEL_FR[status]}`
                    )
                    .join(", ")}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default TranslationHealthPanel;

import { FieldLabel, fieldInputClass } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.8 — private field, distinct tonal background,
// never exposed publicly (enforced server-side: lib/supabase.ts's public
// shapes never include internal_notes). Convention: unverified claims are
// prefixed "⚠ non vérifié:" in the note body (a text convention, not a
// column) — matching the existing content-integrity discipline.
export function InternalNotesSection({
  internalNotes,
  onInternalNotesChange,
}: {
  internalNotes: string;
  onInternalNotesChange: (next: string) => void;
}) {
  return (
    <section className="space-y-2 rounded-card bg-umber/5 p-6">
      <h2 className="font-serif text-lg italic tracking-tight text-ink">
        Notes internes — jamais publiées
      </h2>
      <div>
        <FieldLabel htmlFor="fiche-internal-notes">
          Convention : préfixer les affirmations non sourcées par
          &nbsp;&ldquo;⚠ non vérifié:&rdquo;
        </FieldLabel>
        <textarea
          id="fiche-internal-notes"
          className={`${fieldInputClass} min-h-[6rem] bg-cream`}
          value={internalNotes}
          onChange={(e) => onInternalNotesChange(e.target.value)}
        />
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Small shared pieces for the fiche's section components (docs/ccc-v3-fiche-
// plan.md §3, "Newsreader italic for section headings, Inter uppercase
// tracking-widest for field labels — as FieldLabel in the current dashboard
// editor already does — reuse that pattern"). Not itself a section; kept
// tiny and colocated so the 8 section files don't each redefine these.
// ---------------------------------------------------------------------------

export const fieldInputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-ink outline-none focus:border-ink/30 transition-colors duration-200 ease-soft";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-sans text-xs uppercase tracking-widest text-on-surface-variant"
    >
      {children}
    </label>
  );
}

/**
 * Tonally-separated section shell — No-Line rule (docs/design-direction.md):
 * a surface → surface-container-low shift and generous space-y instead of a
 * 1px border/divider between sections.
 */
export function FicheSection({
  title,
  tone = "low",
  children,
}: {
  title: string;
  tone?: "low" | "lowest";
  children: ReactNode;
}) {
  return (
    <section
      className={`space-y-4 rounded-card p-6 ${
        tone === "low" ? "bg-surface-container-low" : "bg-surface-container-lowest"
      }`}
    >
      <h2 className="font-serif text-lg italic tracking-tight text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

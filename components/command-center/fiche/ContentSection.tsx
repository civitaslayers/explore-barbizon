import { FicheSection, FieldLabel, fieldInputClass } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.3 — plain textareas, no rich-text dependency
// (Section 3.0's no-new-deps argument).
export function ContentSection({
  shortDescription,
  onShortDescriptionChange,
  fullDescription,
  onFullDescriptionChange,
  narrative,
  onNarrativeChange,
}: {
  shortDescription: string;
  onShortDescriptionChange: (next: string) => void;
  fullDescription: string;
  onFullDescriptionChange: (next: string) => void;
  narrative: string;
  onNarrativeChange: (next: string) => void;
}) {
  return (
    <FicheSection title="Contenu (FR)">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <FieldLabel htmlFor="fiche-short">Description courte</FieldLabel>
          <span className="text-[10px] text-on-surface-variant/70">
            {shortDescription.length} car. — alimente les cartes
          </span>
        </div>
        <textarea
          id="fiche-short"
          className={`${fieldInputClass} min-h-[4.5rem]`}
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="fiche-full">Description complète</FieldLabel>
        <textarea
          id="fiche-full"
          className={`${fieldInputClass} min-h-[8rem]`}
          value={fullDescription}
          onChange={(e) => onFullDescriptionChange(e.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="fiche-narrative">Récit</FieldLabel>
        <textarea
          id="fiche-narrative"
          className={`${fieldInputClass} min-h-[8rem]`}
          value={narrative}
          onChange={(e) => onNarrativeChange(e.target.value)}
        />
      </div>
    </FicheSection>
  );
}

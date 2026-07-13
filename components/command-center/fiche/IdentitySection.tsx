import type { FicheCategoryOption } from "@/lib/atlasTypes";
import { FicheSection, FieldLabel, fieldInputClass } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.1
export function IdentitySection({
  name,
  onNameChange,
  slug,
  townLabel,
  categoryId,
  categories,
  onCategoryChange,
}: {
  name: string;
  onNameChange: (next: string) => void;
  slug: string;
  townLabel: string;
  categoryId: string | null;
  categories: FicheCategoryOption[];
  onCategoryChange: (next: string) => void;
}) {
  const selected = categories.find((c) => c.id === categoryId) ?? null;

  return (
    <FicheSection title="Identité">
      <div>
        <FieldLabel htmlFor="fiche-name">Nom</FieldLabel>
        <input
          id="fiche-name"
          className={fieldInputClass}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <FieldLabel htmlFor="fiche-slug">Slug (lecture seule)</FieldLabel>
        <input
          id="fiche-slug"
          className={`${fieldInputClass} bg-surface-container-low text-on-surface-variant`}
          value={slug}
          readOnly
          disabled
          title="Le slug ne peut pas être renommé sans plan de migration."
        />
      </div>

      <div>
        <FieldLabel htmlFor="fiche-category">Catégorie</FieldLabel>
        <select
          id="fiche-category"
          className={fieldInputClass}
          value={categoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="" disabled>
            — choisir —
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.layer}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="mt-1.5 text-xs text-on-surface-variant">
            {selected.name} <span className="text-outline-variant">·</span>{" "}
            {selected.layer}
          </p>
        ) : null}
      </div>

      <p className="text-xs text-on-surface-variant">
        Commune : {townLabel}{" "}
        <span className="text-outline-variant">(lecture seule)</span>
      </p>
    </FicheSection>
  );
}

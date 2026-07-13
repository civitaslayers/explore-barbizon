import { useState } from "react";
import { FicheSection } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.6, locked decision 3 — is_published lives in
// its OWN visually distinct block, never the flags fieldset, never a bulk
// control. Toggling to publish opens a confirm summary; Luigi clicking
// confirm IS the human gate. This component performs the write itself (via
// the two callbacks, which the fiche page implements as an isolated
// single-field PATCH of `is_published` only) — it is deliberately NOT part
// of the generic changed-fields Save, because publishing must be an
// explicit, un-bypassable act, not something that rides along with an
// unrelated edit sitting in the dirty-set.
export function PublishBlock({
  name,
  categoryName,
  showOnMap,
  showInEditorial,
  missingFieldLabels,
  isPublished,
  busy,
  onPublish,
  onUnpublish,
}: {
  name: string;
  categoryName: string;
  showOnMap: boolean;
  showInEditorial: boolean;
  missingFieldLabels: string[];
  isPublished: boolean;
  busy: boolean;
  onPublish: () => void | Promise<void>;
  onUnpublish: () => void | Promise<void>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <FicheSection title="Publication" tone="lowest">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink">
            État actuel :{" "}
            {isPublished ? (
              <span className="rounded-full bg-primary-container px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cream">
                Publié
              </span>
            ) : (
              <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] tracking-[0.06em] text-on-secondary-container">
                Brouillon
              </span>
            )}
          </p>
        </div>
        {isPublished ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onUnpublish()}
            disabled={busy}
          >
            {busy ? "…" : "Dépublier"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
          >
            Publier…
          </button>
        )}
      </div>

      {confirmOpen ? (
        <div className="rounded-card border border-ink/10 bg-cream p-5 shadow-card">
          <p className="eyebrow mb-2">Ce qui va être publié</p>
          <dl className="mb-3 space-y-1.5 text-sm text-ink/80">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Nom</dt>
              <dd>{name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Catégorie</dt>
              <dd>{categoryName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Sur la carte</dt>
              <dd>{showOnMap ? "Oui" : "Non"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">En éditorial</dt>
              <dd>{showInEditorial ? "Oui" : "Non"}</dd>
            </div>
          </dl>
          {missingFieldLabels.length > 0 ? (
            <p className="mb-3 text-xs text-umber">
              Publier sans {missingFieldLabels.join(", ")} ?
            </p>
          ) : (
            <p className="mb-3 text-xs text-moss">Aucune lacune de complétude détectée.</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={busy}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await onPublish();
                setConfirmOpen(false);
              }}
              disabled={busy}
            >
              {busy ? "Publication…" : "Confirmer la publication"}
            </button>
          </div>
        </div>
      ) : null}
    </FicheSection>
  );
}

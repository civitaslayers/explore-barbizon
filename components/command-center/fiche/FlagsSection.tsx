import { FicheSection, FieldLabel, fieldInputClass } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.5 — everything except is_published, which is
// promoted to its own distinct block (PublishBlock, §3.6, locked decision 3).
export function FlagsSection({
  showInEditorial,
  onShowInEditorialChange,
  showOnMap,
  onShowOnMapChange,
  isFeatured,
  onIsFeaturedChange,
  isPremium,
  onIsPremiumChange,
  curationOrder,
  onCurationOrderChange,
  qrCodeUrl,
  onQrCodeUrlChange,
}: {
  showInEditorial: boolean;
  onShowInEditorialChange: (next: boolean) => void;
  showOnMap: boolean;
  onShowOnMapChange: (next: boolean) => void;
  isFeatured: boolean;
  onIsFeaturedChange: (next: boolean) => void;
  isPremium: boolean;
  onIsPremiumChange: (next: boolean) => void;
  curationOrder: string;
  onCurationOrderChange: (next: string) => void;
  qrCodeUrl: string;
  onQrCodeUrlChange: (next: string) => void;
}) {
  return (
    <FicheSection title="Visibilité & curation">
      <fieldset className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={showInEditorial}
            onChange={(e) => onShowInEditorialChange(e.target.checked)}
          />
          Afficher en éditorial
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={showOnMap}
            onChange={(e) => onShowOnMapChange(e.target.checked)}
          />
          Afficher sur la carte
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={isFeatured}
            onChange={(e) => onIsFeaturedChange(e.target.checked)}
          />
          Mise en avant (featured)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={isPremium}
            onChange={(e) => onIsPremiumChange(e.target.checked)}
          />
          Premium
        </label>
      </fieldset>

      <div>
        <FieldLabel htmlFor="fiche-curation">Ordre de curation</FieldLabel>
        <input
          id="fiche-curation"
          type="text"
          inputMode="numeric"
          className={fieldInputClass}
          value={curationOrder}
          onChange={(e) => onCurationOrderChange(e.target.value)}
          placeholder="Optionnel"
        />
      </div>

      <div>
        <FieldLabel htmlFor="fiche-qr">QR code (URL)</FieldLabel>
        <input
          id="fiche-qr"
          type="text"
          className={fieldInputClass}
          value={qrCodeUrl}
          onChange={(e) => onQrCodeUrlChange(e.target.value)}
          placeholder="Optionnel"
        />
      </div>
    </FicheSection>
  );
}

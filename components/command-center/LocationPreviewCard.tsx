import { useState } from "react";
import Link from "next/link";
import type { AtlasLocation } from "@/lib/atlasTypes";
import { CompletenessBadge } from "@/components/command-center/CompletenessBadge";
import { OpeningHoursEditor } from "@/components/command-center/OpeningHoursEditor";
import type { OpeningHoursObject } from "@/lib/openingHours";

// ---------------------------------------------------------------------------
// Shared read-mostly summary card — docs/ccc-v3-fiche-plan.md Section 2 +
// §2.1 (Phase 2 card quick-edit). Rendered by the Atlas index over either
// the map or the list view when `?sel=` is set.
//
// Phase 2: address/phone/website are inline click-to-edit; opening_hours is
// a compact OpeningHoursEditor in a popover. All writes go through the same
// verified changed-fields-only PATCH /api/locations/[id] as the fiche, with
// source_page='/command-center/atlas#card' for audit provenance. NOT
// editable here: descriptions, flags, category, position, is_published —
// those are fiche-only (locked decision 3; the card never publishes).
//
// The parent (pages/command-center/atlas/index.tsx) mounts this with
// `key={location.id}` so this component's local field state resets cleanly
// whenever the selection changes to a different location.
// ---------------------------------------------------------------------------

const SOURCE_PAGE = "/command-center/atlas#card";

type FieldSaveState = "idle" | "saving" | "saved" | "error";

async function patchField(
  locationId: string,
  field: string,
  value: unknown
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const res = await fetch(`/api/locations/${locationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value, source_page: SOURCE_PAGE }),
    });
    const raw = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: `Réponse non-JSON du serveur (HTTP ${res.status})` };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : "Échec de l'enregistrement.",
      };
    }
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function QuickEditText({
  label,
  value,
  locationId,
  field,
  onSaved,
  emptyLabel,
}: {
  label: string;
  value: string | null;
  locationId: string;
  field: "address" | "phone" | "website";
  onSaved: (next: string) => void;
  emptyLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [state, setState] = useState<FieldSaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed === (value ?? "")) {
      setEditing(false);
      return;
    }
    setState("saving");
    setError(null);
    const res = await patchField(locationId, field, trimmed);
    if (!res.ok) {
      setState("error");
      setError(res.error);
      return;
    }
    setState("saved");
    onSaved(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
    setState("idle");
    setError(null);
  };

  return (
    <div className="mb-2">
      <p className="text-[9px] uppercase tracking-[0.15em] text-ink/35">{label}</p>
      {editing ? (
        <input
          autoFocus
          type="text"
          className="w-full rounded bg-ink/5 px-2 py-1 text-xs text-ink outline-none focus:bg-ink/10"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") cancel();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="block w-full text-left text-xs leading-snug text-ink/70 hover:text-ink"
        >
          {value ? (
            value
          ) : (
            <span className="italic text-ink/35">— {emptyLabel} —</span>
          )}
        </button>
      )}
      {state === "saving" ? (
        <span className="text-[9px] text-ink/40">enregistrement…</span>
      ) : null}
      {state === "error" && error ? (
        <span className="text-[9px] text-umber">{error}</span>
      ) : null}
    </div>
  );
}

function HoursQuickEdit({
  locationId,
  value,
  onSaved,
}: {
  locationId: string;
  value: OpeningHoursObject | null;
  onSaved: (next: OpeningHoursObject) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<OpeningHoursObject | null>(value);
  const [state, setState] = useState<FieldSaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const commit = async () => {
    setState("saving");
    setError(null);
    const res = await patchField(locationId, "opening_hours", draft ?? {});
    if (!res.ok) {
      setState("error");
      setError(res.error);
      return;
    }
    setState("saved");
    onSaved(draft ?? {});
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setOpen((v) => !v);
        }}
        className="chip"
      >
        Horaires
      </button>
      {open ? (
        <div className="card shadow-card absolute bottom-full left-0 z-40 mb-2 w-72 p-3">
          <OpeningHoursEditor value={draft} onChange={setDraft} compact />
          {state === "error" && error ? (
            <p className="mt-1.5 text-[10px] text-umber">{error}</p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
              disabled={state === "saving"}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={commit}
              disabled={state === "saving"}
            >
              {state === "saving" ? "…" : "Enregistrer"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LocationPreviewCard({
  location,
  view = "map",
  onClose,
  onCenter,
}: {
  location: AtlasLocation;
  view?: "map" | "list";
  onClose: () => void;
  onCenter?: () => void;
}) {
  const [address, setAddress] = useState(location.address);
  const [phone, setPhone] = useState(location.phone);
  const [website, setWebsite] = useState(location.website);
  const [openingHours, setOpeningHours] = useState<OpeningHoursObject | null>(
    location.openingHours
  );

  return (
    <div className="card shadow-card fixed bottom-8 left-4 z-30 w-80 overflow-visible p-0">
      {/* Photo / honest empty slot */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-card bg-surface-container-low">
        {location.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={location.photoUrl}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-ink/30">
              — sans photo —
            </span>
          </div>
        )}
        <span
          aria-hidden
          className="absolute left-3 top-3 inline-block h-2 w-2 rounded-full shadow-sm"
          style={{ backgroundColor: location.color }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/40 text-sm leading-none text-cream transition-colors hover:bg-ink/60"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <p className="heading-lg truncate">{location.name}</p>
          {location.isPublished ? (
            <span className="shrink-0 rounded-full bg-primary-container px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cream">
              Publié
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-secondary-container px-3 py-1 text-[10px] tracking-[0.06em] text-on-secondary-container">
              Brouillon
            </span>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="chip">{location.categoryName}</span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-ink/35">
            {location.showOnMap ? "carte" : "hors carte"} ·{" "}
            {location.showInEditorial ? "éditorial" : "hors éditorial"}
          </span>
        </div>

        <QuickEditText
          label="Adresse"
          value={address}
          locationId={location.id}
          field="address"
          onSaved={setAddress}
          emptyLabel="sans adresse"
        />

        <p className="mb-3 line-clamp-2 text-xs leading-snug text-ink/60">
          {location.shortDescription ? (
            location.shortDescription
          ) : (
            <span className="italic text-ink/35">— sans description —</span>
          )}
        </p>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <QuickEditText
            label="Téléphone"
            value={phone}
            locationId={location.id}
            field="phone"
            onSaved={setPhone}
            emptyLabel="sans téléphone"
          />
          <QuickEditText
            label="Site web"
            value={website}
            locationId={location.id}
            field="website"
            onSaved={setWebsite}
            emptyLabel="sans site"
          />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <CompletenessBadge
            score={location.completeness.score}
            band={location.completeness.band}
            showLabel
          />
          <p className="font-mono text-[10px] text-ink/40">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <HoursQuickEdit
            locationId={location.id}
            value={openingHours}
            onSaved={setOpeningHours}
          />
          <Link
            href={`/command-center/atlas/${location.id}?from=${view}`}
            className="btn btn-secondary flex-1 text-center"
          >
            Ouvrir la fiche →
          </Link>
          {onCenter ? (
            <button
              type="button"
              onClick={onCenter}
              className="btn btn-secondary"
            >
              Centrer
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

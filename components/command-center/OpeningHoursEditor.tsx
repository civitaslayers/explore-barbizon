import { useMemo } from "react";
import {
  DAY_KEYS,
  DAY_LABELS_FR,
  NON_DAY_LABELS_FR,
  buildOpeningHours,
  splitOpeningHours,
  type DayKey,
  type OpeningHoursObject,
} from "@/lib/openingHours";

// ---------------------------------------------------------------------------
// OpeningHoursEditor — docs/ccc-v3-phase2-implementation-plan.md item 7 /
// docs/ccc-v3-fiche-plan.md §3.4. Reused by the fiche's PracticalSection and
// the card's compact popover.
//
// Fully controlled + derived: the 7 day rows and the "others" list are
// recomputed from `value` via lib/openingHours.splitOpeningHours on every
// render (no internal state to desync from the parent's snapshot) — every
// keystroke calls onChange with the whole rebuilt object; the PARENT owns
// dirty-tracking and the PATCH, exactly as the fiche plan specifies. Works
// before or after the 16-row normalization migration, and never drops an
// object-valued or unrecognized key (lib/openingHours.ts findings 1–2).
// ---------------------------------------------------------------------------

const inputClass =
  "w-full rounded-lg bg-ink/5 px-3 py-1.5 text-sm text-ink placeholder:text-ink/35 outline-none focus:bg-ink/10 transition-colors duration-200 ease-soft";

export function OpeningHoursEditor({
  value,
  onChange,
  compact = false,
}: {
  value: OpeningHoursObject | null;
  onChange: (next: OpeningHoursObject) => void;
  compact?: boolean;
}) {
  const { days, others } = useMemo(() => splitOpeningHours(value), [value]);

  const setDay = (day: DayKey, text: string) => {
    onChange(buildOpeningHours({ ...days, [day]: text }, others));
  };

  const setOtherValue = (index: number, text: string) => {
    const next = others.map((entry, i) =>
      i === index ? { ...entry, value: text } : entry
    );
    onChange(buildOpeningHours(days, next));
  };

  const removeOther = (index: number) => {
    onChange(buildOpeningHours(days, others.filter((_, i) => i !== index)));
  };

  const labelClass = `shrink-0 font-sans uppercase tracking-widest text-on-surface-variant ${
    compact ? "w-16 text-[9px]" : "w-24 text-[10px]"
  }`;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className={compact ? "space-y-1.5" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        {DAY_KEYS.map((day) => (
          <div key={day} className="flex items-center gap-2">
            <label htmlFor={`hours-${day}`} className={labelClass}>
              {DAY_LABELS_FR[day]}
            </label>
            <input
              id={`hours-${day}`}
              type="text"
              className={inputClass}
              value={days[day]}
              onChange={(e) => setDay(day, e.target.value)}
              placeholder="Fermé, ou horaires…"
            />
          </div>
        ))}
      </div>

      {others.length > 0 ? (
        <div className="space-y-1.5 pt-1.5">
          <p className="text-[9px] font-sans uppercase tracking-widest text-on-surface-variant/70">
            Autres entrées (existantes)
          </p>
          {others.map((entry, i) => (
            <div key={`${entry.key}-${i}`} className="flex items-center gap-2">
              <span className={labelClass} title={entry.key}>
                {NON_DAY_LABELS_FR[entry.key] ?? entry.key}
              </span>
              {entry.editable ? (
                <input
                  type="text"
                  className={inputClass}
                  value={entry.value}
                  onChange={(e) => setOtherValue(i, e.target.value)}
                />
              ) : (
                <span
                  className="flex-1 truncate rounded-lg bg-ink/[0.03] px-3 py-1.5 font-mono text-[11px] text-ink/50"
                  title="Valeur préservée telle quelle — non modifiable ici (voir lib/openingHours.ts)"
                >
                  {entry.value}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeOther(i)}
                aria-label={`Supprimer ${entry.key}`}
                className="shrink-0 text-sm leading-none text-ink/30 transition-colors duration-200 hover:text-umber"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next/pages";
import {
  MY_DAY_QUERY_PARAM,
  buildDayParam,
  formatDistance,
  legDistancesMeters,
  moveItem,
  suggestOrder,
  totalMeters,
} from "@/lib/myDay";

export type DayStop = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  stops: DayStop[];
  shared: boolean;
  unavailableCount: number;
  storedCount: number;
  persisted: boolean;
  locale: string;
  onClose: () => void;
  /** Own mode: new order of the resolved stops. */
  onReorder: (orderedSlugs: string[]) => void;
  onRemove: (slug: string) => void;
  onClear: () => void;
  /** Shared mode actions. */
  onSaveShared: () => void;
  onBackToMine: () => void;
};

const iconBtn =
  "flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-xs text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30";
const textBtn =
  "rounded-full border border-ink/20 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink/5";

export default function MyDayPanel({
  stops,
  shared,
  unavailableCount,
  storedCount,
  persisted,
  locale,
  onClose,
  onReorder,
  onRemove,
  onClear,
  onSaveShared,
  onBackToMine,
}: Props) {
  const { t } = useTranslation("common");
  const [undo, setUndo] = useState<{ before: string[]; after: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailedUrl, setCopyFailedUrl] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const failedInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!confirmClear) return;
    const id = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(id);
  }, [confirmClear]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (copyFailedUrl) failedInputRef.current?.select();
  }, [copyFailedUrl]);

  const slugs = stops.map((s) => s.slug);
  const legs = legDistancesMeters(stops);
  const total = totalMeters(stops);
  const suggested = suggestOrder(stops);
  const canSuggest =
    !shared &&
    stops.length >= 3 &&
    totalMeters(suggested) < total - 0.5; // strictly shorter
  const canUndo =
    !shared &&
    undo !== null &&
    undo.after.length === slugs.length &&
    undo.after.every((s, i) => s === slugs[i]);

  const applySuggestion = () => {
    const after = suggested.map((s) => s.slug);
    setUndo({ before: slugs, after });
    onReorder(after);
  };

  const undoSuggestion = () => {
    if (undo) onReorder(undo.before);
    setUndo(null);
  };

  const copyLink = async () => {
    const prefix = locale === "fr" ? "" : `/${locale}`;
    const url = `${window.location.origin}${prefix}/map?${MY_DAY_QUERY_PARAM}=${buildDayParam(slugs)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyFailedUrl(null);
      setCopied(true);
    } catch {
      setCopyFailedUrl(url);
    }
  };

  const onClearClick = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    setUndo(null);
    onClear();
  };

  return (
    <aside
      aria-labelledby="my-day-title"
      className="absolute inset-x-0 bottom-12 z-30 flex max-h-[65%] flex-col overflow-hidden rounded-[30px] shadow-card md:inset-x-auto md:bottom-10 md:right-4 md:max-h-[calc(100%-7rem)] md:w-96 md:rounded-card"
    >
      <div className="flex-shrink-0 bg-ink px-6 pb-5 pt-5 text-cream">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cream/60">
            {shared ? t("myDay.sharedKicker") : t("myDay.kicker")}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("map.close")}
            className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs text-cream/70 transition-colors hover:text-cream"
          >
            ✕
          </button>
        </div>
        <h2
          id="my-day-title"
          className="mt-2 font-serif text-[1.65rem] font-light italic leading-tight tracking-tight"
        >
          {stops.length > 0
            ? t("myDay.title", { count: stops.length })
            : t("myDay.emptyTitle")}
        </h2>
        {stops.length >= 2 ? (
          <p className="mt-2 text-[11px] text-cream/60">
            {t("myDay.totalDistance", { distance: formatDistance(total, locale) })}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-cream px-6 py-5">
        {stops.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink/65">
            {t("myDay.emptyBody")}
          </p>
        ) : (
          <ol className="m-0 list-none p-0">
            {stops.map((stop, i) => {
              const last = i === stops.length - 1;
              return (
                <li key={stop.slug} className="flex gap-4">
                  <div className="flex w-8 flex-shrink-0 flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-umber text-xs font-medium text-cream">
                      {i + 1}
                    </span>
                    {!last ? <span className="w-px flex-1 bg-ink/15" /> : null}
                  </div>
                  <div className={`min-w-0 flex-1 ${last ? "" : "pb-5"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif text-lg leading-snug text-ink">
                        {stop.name}
                      </p>
                      {!shared ? (
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <button
                            type="button"
                            className={iconBtn}
                            disabled={i === 0}
                            aria-label={t("myDay.moveUp", { name: stop.name })}
                            onClick={() => onReorder(moveItem(slugs, i, i - 1))}
                          >
                            <span aria-hidden>↑</span>
                          </button>
                          <button
                            type="button"
                            className={iconBtn}
                            disabled={last}
                            aria-label={t("myDay.moveDown", { name: stop.name })}
                            onClick={() => onReorder(moveItem(slugs, i, i + 1))}
                          >
                            <span aria-hidden>↓</span>
                          </button>
                          <button
                            type="button"
                            className={iconBtn}
                            aria-label={t("myDay.removeAria", { name: stop.name })}
                            onClick={() => onRemove(stop.slug)}
                          >
                            <span aria-hidden>✕</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {!last ? (
                      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-umber">
                        {t("myDay.legDistance", {
                          distance: formatDistance(legs[i], locale),
                        })}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {unavailableCount > 0 ? (
          <p className="mt-4 rounded-xl bg-secondary-container px-3.5 py-2.5 text-[11px] leading-relaxed text-on-secondary-container">
            {t("myDay.unavailable", { count: unavailableCount })}
          </p>
        ) : null}
        {!persisted && !shared ? (
          <p className="mt-4 rounded-xl bg-secondary-container px-3.5 py-2.5 text-[11px] leading-relaxed text-on-secondary-container">
            {t("myDay.notSaved")}
          </p>
        ) : null}

        {stops.length >= 2 ? (
          <p className="mt-4 text-[11px] leading-relaxed text-ink/50">
            {t("myDay.distanceNote")}
          </p>
        ) : null}

        {shared ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {stops.length > 0 ? (
              <button
                type="button"
                onClick={onSaveShared}
                className="rounded-full bg-ink px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cream transition-opacity hover:opacity-90"
              >
                {storedCount === 0
                  ? t("myDay.saveShared")
                  : t("myDay.replaceWithShared", { count: storedCount })}
              </button>
            ) : null}
            <button type="button" onClick={onBackToMine} className={textBtn}>
              {t("myDay.backToMine")}
            </button>
          </div>
        ) : stops.length > 0 ? (
          <div className="mt-5 space-y-3">
            {canSuggest ? (
              <div>
                <button type="button" onClick={applySuggestion} className={textBtn}>
                  {t("myDay.suggestOrder")}
                </button>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink/50">
                  {t("myDay.suggestOrderNote")}
                </p>
              </div>
            ) : null}
            {canUndo ? (
              <button type="button" onClick={undoSuggestion} className={textBtn}>
                {t("myDay.undoOrder")}
              </button>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyLink} className={textBtn}>
                {copied ? t("myDay.linkCopied") : t("myDay.copyLink")}
              </button>
              <button
                type="button"
                onClick={onClearClick}
                className={`${textBtn} ${confirmClear ? "bg-ink text-cream hover:bg-ink" : ""}`}
              >
                {confirmClear ? t("myDay.clearConfirm") : t("myDay.clear")}
              </button>
            </div>
            {copyFailedUrl ? (
              <div>
                <label
                  htmlFor="my-day-copy-url"
                  className="text-[11px] text-ink/60"
                >
                  {t("myDay.copyFailed")}
                </label>
                <input
                  id="my-day-copy-url"
                  ref={failedInputRef}
                  readOnly
                  value={copyFailedUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="mt-1 w-full rounded-full border border-ink/15 bg-cream/60 px-3.5 py-2 text-[11px] text-ink focus:outline-none"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

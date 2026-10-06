// ---------------------------------------------------------------------------
// lib/useMyDay.ts
//
// Client store for the "My day" planner (task 3c5b17b5). The ONLY file that
// touches localStorage; every access goes through readRaw/writeRaw in a
// try/catch. If storage is blocked or throws, an in-memory fallback keeps the
// day working for the page lifetime and `persisted` turns false.
// ---------------------------------------------------------------------------

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  MY_DAY_MAX_STOPS,
  MY_DAY_STORAGE_KEY,
  moveItem,
  sanitizeSlugs,
} from "./myDay";

const CHANGE_EVENT = "eb:myday";

type Snapshot = { slugs: string[]; persisted: boolean };

const EMPTY_SLUGS: string[] = Object.freeze([]) as unknown as string[];
const SERVER_SNAPSHOT: Snapshot = Object.freeze({
  slugs: EMPTY_SLUGS,
  persisted: true,
}) as Snapshot;

let memoryRaw: string | null = null;
let storageFailed = false;

function readRaw(): string | null {
  if (storageFailed) return memoryRaw;
  try {
    return window.localStorage.getItem(MY_DAY_STORAGE_KEY);
  } catch {
    storageFailed = true;
    return memoryRaw;
  }
}

function writeRaw(raw: string): void {
  memoryRaw = raw;
  if (storageFailed) return;
  try {
    window.localStorage.setItem(MY_DAY_STORAGE_KEY, raw);
  } catch {
    storageFailed = true;
  }
}

function parseRaw(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return sanitizeSlugs(JSON.parse(raw));
  } catch {
    return [];
  }
}

let cachedKey: string | null | undefined;
let cachedFailed = false;
let cachedSnapshot: Snapshot = SERVER_SNAPSHOT;

function getSnapshot(): Snapshot {
  const raw = readRaw();
  if (raw === cachedKey && storageFailed === cachedFailed) return cachedSnapshot;
  cachedKey = raw;
  cachedFailed = storageFailed;
  cachedSnapshot = { slugs: parseRaw(raw), persisted: !storageFailed };
  return cachedSnapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === MY_DAY_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function commit(next: string[]): void {
  writeRaw(JSON.stringify(sanitizeSlugs(next)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export type AddResult = "added" | "exists" | "full";

export function useMyDay() {
  const { slugs, persisted } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const add = useCallback((slug: string): AddResult => {
    const current = getSnapshot().slugs;
    if (current.includes(slug)) return "exists";
    if (current.length >= MY_DAY_MAX_STOPS) return "full";
    commit([...current, slug]);
    return "added";
  }, []);

  const remove = useCallback((slug: string) => {
    commit(getSnapshot().slugs.filter((s) => s !== slug));
  }, []);

  const toggle = useCallback((slug: string): AddResult | "removed" => {
    if (getSnapshot().slugs.includes(slug)) {
      commit(getSnapshot().slugs.filter((s) => s !== slug));
      return "removed";
    }
    return add(slug);
  }, [add]);

  const move = useCallback((from: number, to: number) => {
    commit(moveItem(getSnapshot().slugs, from, to));
  }, []);

  const replaceAll = useCallback((next: string[]) => {
    commit(next);
  }, []);

  const clear = useCallback(() => commit([]), []);

  return useMemo(
    () => ({
      slugs,
      persisted,
      isFull: slugs.length >= MY_DAY_MAX_STOPS,
      has,
      add,
      remove,
      toggle,
      move,
      replaceAll,
      clear,
    }),
    [slugs, persisted, has, add, remove, toggle, move, replaceAll, clear]
  );
}

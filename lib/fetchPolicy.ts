// ---------------------------------------------------------------------------
// lib/fetchPolicy.ts
//
// Failure policy for Supabase reads in page data methods (getStaticProps,
// getStaticPaths, sitemap getServerSideProps). Pure: no React, no Next, no
// Supabase, no @/ imports — testable with `node --test lib/fetchPolicy.test.ts`.
//
// withRetry: primary data — one retry after a short backoff, then rethrow
//   (build: deploy fails; ISR: last good page is kept; on-demand first
//   render: one 500, next request retries).
// degrade:   secondary sections — same retry, then log and return fallback.
// Reads are idempotent, so retrying is always safe. Everything is retried
// once except the explicit non-retryable set below (config / empty-result
// errors from lib/supabase.ts, which are real answers, not transport flakes).
// supabase-js never rejects on a transport failure; it returns
// { error: { message: "TypeError: fetch failed", code: "" } } and
// lib/supabase.ts rethrows error.message — so classification is by message.
// ---------------------------------------------------------------------------

export const DEFAULT_BACKOFF_MS = 1500;

/** Deterministic answers from lib/supabase.ts — retrying cannot change them. */
const NON_RETRYABLE: readonly RegExp[] = [
  /^Supabase not configured$/,
  /^No published locations$/,
  /^No published stories$/,
  /^No tours found$/,
];

export type FetchPolicyOptions = {
  /** Injectable for tests; default is setTimeout. */
  sleep?: (ms: number) => Promise<void>;
  /** Default DEFAULT_BACKOFF_MS. */
  backoffMs?: number;
  /** Injectable for tests; default is console. */
  logger?: Pick<Console, "error">;
};

const defaultSleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function isRetryable(err: unknown): boolean {
  const message = errorMessage(err);
  return !NON_RETRYABLE.some((re) => re.test(message));
}

type Outcome<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown; retried: boolean };

// Single internal core so neither public function double-logs: this emits
// at most the one "retrying" line; withRetry/degrade each add exactly one
// final line on failure.
async function attempt<T>(
  label: string,
  fn: () => Promise<T>,
  opts: FetchPolicyOptions
): Promise<Outcome<T>> {
  const sleep = opts.sleep ?? defaultSleep;
  const logger = opts.logger ?? console;
  const backoffMs = opts.backoffMs ?? DEFAULT_BACKOFF_MS;
  try {
    return { ok: true, value: await fn() };
  } catch (first) {
    if (!isRetryable(first)) return { ok: false, error: first, retried: false };
    logger.error(
      `[fetchPolicy] ${label}: retrying in ${backoffMs}ms after: ${errorMessage(first)}`
    );
    await sleep(backoffMs);
    try {
      return { ok: true, value: await fn() };
    } catch (second) {
      return { ok: false, error: second, retried: true };
    }
  }
}

/**
 * Primary data: retry once, then rethrow (the second error when retried).
 */
export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  opts: FetchPolicyOptions = {}
): Promise<T> {
  const outcome = await attempt(label, fn, opts);
  if (outcome.ok) return outcome.value;
  const logger = opts.logger ?? console;
  logger.error(
    `[fetchPolicy] ${label}: failed${outcome.retried ? " after retry" : " (not retryable)"}: ${errorMessage(outcome.error)}`
  );
  throw outcome.error;
}

/**
 * Secondary sections: retry once, then log and return `fallback`. Never throws.
 */
export async function degrade<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
  opts: FetchPolicyOptions = {}
): Promise<T> {
  const outcome = await attempt(label, fn, opts);
  if (outcome.ok) return outcome.value;
  const logger = opts.logger ?? console;
  logger.error(
    `[fetchPolicy] ${label}: degraded to fallback${outcome.retried ? " after retry" : " (not retryable)"}: ${errorMessage(outcome.error)}`
  );
  return fallback;
}

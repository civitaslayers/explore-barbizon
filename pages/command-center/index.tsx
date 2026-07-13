import type { GetServerSideProps, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import {
  TranslationHealthPanel,
  type TranslationHealthSummary,
  type TranslationHealthCounts,
  type EnStatus,
} from "@/components/command-center/TranslationHealthPanel";
import { getOverviewStats } from "@/lib/commandCenter";
import type { TaskStatus } from "@/lib/commandCenter";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type NextPageWithLayout<P> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type CommandCenterIndexProps = {
  translationHealth: TranslationHealthSummary[];
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  ready: "Ready",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  backlog: "bg-ink/8 text-ink/50",
  ready: "bg-umber/10 text-umber",
  in_progress: "bg-moss/15 text-moss",
  review: "bg-ink/15 text-ink/70",
  done: "bg-ink text-cream",
};

type Stats = Awaited<ReturnType<typeof getOverviewStats>>;

const CommandCenterIndex: NextPageWithLayout<CommandCenterIndexProps> = ({
  translationHealth,
}) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverviewStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="eyebrow mb-1">Internal Dashboard</p>
        <h1 className="font-serif text-2xl tracking-tight">Overview</h1>
      </div>

      <div className="mb-8">
        <TranslationHealthPanel summaries={translationHealth} />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-6 p-3 bg-red-50 rounded border border-red-200">
          {error}
        </p>
      )}

      {!stats && !error && (
        <p className="text-sm text-ink/40">Loading...</p>
      )}

      {stats && (
        <div className="space-y-8">
          {/* Task status counts */}
          <section>
            <p className="eyebrow mb-3">Tasks by Status</p>
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <Link
                  key={s}
                  href={`/command-center/tasks?status=${s}`}
                  className={`no-underline px-4 py-2.5 rounded border border-ink/10 text-center min-w-[90px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
                >
                  <p className="text-xl font-serif leading-none mb-1">
                    {stats.tasksByStatus[s] ?? 0}
                  </p>
                  <p className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full inline-block ${STATUS_STYLE[s]}`}>
                    {STATUS_LABELS[s]}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            {/* Recent tasks */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="eyebrow">Recent Tasks</p>
                <Link href="/command-center/tasks" className="text-[10px] text-ink/40 no-underline hover:text-ink uppercase tracking-[0.15em]">
                  All →
                </Link>
              </div>
              <div className="border border-ink/10 rounded-lg overflow-hidden">
                {stats.recentTasks.length === 0 ? (
                  <p className="text-sm text-ink/35 px-4 py-6 text-center">No tasks yet</p>
                ) : (
                  stats.recentTasks.map((t, i) => (
                    <Link
                      key={t.id}
                      href={`/command-center/tasks/${t.id}`}
                      className={`flex items-center justify-between px-4 py-3 no-underline hover:bg-ink/3 transition-colors ${i > 0 ? "border-t border-ink/8" : ""}`}
                    >
                      <span className="text-sm text-ink truncate pr-3">{t.title}</span>
                      <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[t.status as TaskStatus] ?? "bg-ink/10 text-ink/50"}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Recent decisions */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="eyebrow">Recent Decisions</p>
                <Link href="/command-center/decisions" className="text-[10px] text-ink/40 no-underline hover:text-ink uppercase tracking-[0.15em]">
                  All →
                </Link>
              </div>
              <div className="border border-ink/10 rounded-lg overflow-hidden">
                {stats.recentDecisions.length === 0 ? (
                  <p className="text-sm text-ink/35 px-4 py-6 text-center">No decisions yet</p>
                ) : (
                  stats.recentDecisions.map((d, i) => (
                    <div
                      key={d.id}
                      className={`px-4 py-3 ${i > 0 ? "border-t border-ink/8" : ""}`}
                    >
                      <p className="text-sm text-ink leading-snug">{d.title}</p>
                      {d.decision && (
                        <p className="text-[11px] text-ink/45 mt-0.5 line-clamp-1">{d.decision}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent outputs */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="eyebrow">Recent Outputs</p>
              </div>
              <div className="border border-ink/10 rounded-lg overflow-hidden">
                {stats.recentOutputs.length === 0 ? (
                  <p className="text-sm text-ink/35 px-4 py-6 text-center">No outputs yet</p>
                ) : (
                  stats.recentOutputs.map((o, i) => (
                    <div
                      key={o.id}
                      className={`px-4 py-3 ${i > 0 ? "border-t border-ink/8" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-ink/40">{o.agent}</span>
                        {o.task_id && (
                          <Link href={`/command-center/tasks/${o.task_id}`} className="text-[10px] text-umber no-underline hover:text-moss">
                            view task →
                          </Link>
                        )}
                      </div>
                      <p className="text-[11px] text-ink/60 line-clamp-2 leading-relaxed">
                        {o.response ?? o.prompt ?? "—"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent memory */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="eyebrow">Recent Memory</p>
                <Link href="/command-center/memory" className="text-[10px] text-ink/40 no-underline hover:text-ink uppercase tracking-[0.15em]">
                  All →
                </Link>
              </div>
              <div className="border border-ink/10 rounded-lg overflow-hidden">
                {stats.recentMemory.length === 0 ? (
                  <p className="text-sm text-ink/35 px-4 py-6 text-center">No memory entries yet</p>
                ) : (
                  stats.recentMemory.map((m, i) => (
                    <div
                      key={m.id}
                      className={`px-4 py-3 ${i > 0 ? "border-t border-ink/8" : ""}`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.15em] text-ink/40 mb-0.5">{m.key}</p>
                      <p className="text-[11px] text-ink/60 line-clamp-2 leading-relaxed">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

CommandCenterIndex.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

// ---------------------------------------------------------------------------
// getServerSideProps — supabaseAdmin (service role) reads v_translation_health,
// published rows only (docs/schema-reference.md, "View — v_translation_health";
// docs/i18n-seo-implementation-plan.md, Task 5b). Read-only, no writes.
// ---------------------------------------------------------------------------

type TranslationHealthRow = {
  entity_type: string;
  is_published: boolean | null;
  en_status: EnStatus;
};

function emptyCounts(): TranslationHealthCounts {
  return { missing: 0, stale: 0, draft: 0, current: 0 };
}

export const getServerSideProps: GetServerSideProps<
  CommandCenterIndexProps
> = async () => {
  try {
    // `v_translation_health` is a live view (added 2026-07-13 with the i18n
    // groundwork, docs/schema-reference.md) but `lib/supabase.types.ts` was
    // not regenerated afterward and has no entry for it (nor for several
    // other post-2026-07-13 columns) — flagged as a follow-up in the
    // implementer report. Cast the client for this one query rather than
    // widening the shared `Database` type for a single untyped view.
    const untypedAdmin = supabaseAdmin as unknown as {
      from: (table: string) => {
        select: (columns: string) => {
          eq: (
            column: string,
            value: boolean
          ) => Promise<{ data: unknown; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await untypedAdmin
      .from("v_translation_health")
      .select("entity_type, is_published, en_status")
      .eq("is_published", true);

    if (error) throw new Error(error.message);

    const byType = new Map<string, TranslationHealthCounts>();
    for (const row of (data ?? []) as TranslationHealthRow[]) {
      const counts = byType.get(row.entity_type) ?? emptyCounts();
      if (row.en_status in counts) {
        counts[row.en_status] += 1;
      }
      byType.set(row.entity_type, counts);
    }

    const translationHealth: TranslationHealthSummary[] = Array.from(
      byType.entries()
    ).map(([entityType, counts]) => ({ entityType, counts }));

    return { props: { translationHealth } };
  } catch {
    // Read-only dashboard panel — a query failure (e.g. view not deployed
    // yet in a given environment) degrades to an empty panel, never a 500.
    return { props: { translationHealth: [] } };
  }
};

export default CommandCenterIndex;

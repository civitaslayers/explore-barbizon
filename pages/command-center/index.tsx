import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import { getOverviewStats } from "@/lib/commandCenter";
import type { TaskStatus } from "@/lib/commandCenter";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
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

const CommandCenterIndex: NextPageWithLayout = () => {
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

export default CommandCenterIndex;

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type StoryRow = {
  id: string;
  title: string;
  slug: string;
  type: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

type PageProps = { rows: StoryRow[] };

function Tick({ on }: { on: boolean }) {
  return <span className="text-on-surface-variant">{on ? "✓" : "—"}</span>;
}

function TypeChip({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === "history") {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs bg-secondary-container text-on-secondary-container">
        history
      </span>
    );
  }
  if (t === "guide") {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs bg-surface-variant text-on-surface-variant">
        guide
      </span>
    );
  }
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs bg-surface-variant text-on-surface-variant">
      {type}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  if (!supabase) {
    return { props: { rows: [] } };
  }

  const { data, error } = await supabase
    .from("stories")
    .select("id, title, slug, type, is_published, published_at, updated_at")
    .order("type", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("dashboard stories list", error.message);
    return { props: { rows: [] } };
  }

  return {
    props: {
      rows: (data ?? []) as StoryRow[],
    },
  };
};

const DashboardStoriesIndex: NextPage<PageProps> = ({ rows }) => {
  return (
    <DashboardLayout>
      <div className="max-w-content">
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-6">
          Stories
        </h1>
        <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-sm text-left min-w-[44rem]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-3 py-2 font-sans font-medium text-ink">
                  Title
                </th>
                <th className="px-3 py-2 font-sans font-medium text-ink">
                  Type
                </th>
                <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                  Published
                </th>
                <th className="px-3 py-2 font-sans font-medium text-ink">
                  Published date
                </th>
                <th className="px-3 py-2 font-sans font-medium text-ink w-24">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-on-surface-variant"
                  >
                    No stories loaded.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-outline-variant last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/stories/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-umber hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <TypeChip type={row.type} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Tick on={row.is_published} />
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                      {formatDate(row.published_at)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="text-sm text-outline-variant cursor-not-allowed select-none"
                        aria-disabled="true"
                      >
                        Edit
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStoriesIndex;

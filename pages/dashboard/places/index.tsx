import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type DashboardPlaceRow = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  functionCount: number;
};

type PageProps = { rows: DashboardPlaceRow[] };

function Tick({ on }: { on: boolean }) {
  return <span className="text-on-surface-variant">{on ? "✓" : "—"}</span>;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  if (!supabase) {
    return { props: { rows: [] } };
  }

  const { data, error } = await supabase.from("places").select(`
      id, name, slug, is_published,
      place_functions ( count )
    `);

  if (error || !data) {
    console.error("dashboard places list", error?.message);
    return { props: { rows: [] } };
  }

  const rows: DashboardPlaceRow[] = (
    data as {
      id: string;
      name: string;
      slug: string;
      is_published: boolean;
      place_functions: { count: number }[] | null;
    }[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    is_published: row.is_published,
    functionCount: row.place_functions?.[0]?.count ?? 0,
  }));

  rows.sort((a, b) => a.name.localeCompare(b.name));

  return { props: { rows } };
};

function PlacesTable({ rows }: { rows: DashboardPlaceRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.slug.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  return (
    <>
      <div className="mb-4 max-w-md">
        <label className="sr-only" htmlFor="places-filter">
          Filter by name or slug
        </label>
        <input
          id="places-filter"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name or slug…"
          className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-ink placeholder:text-on-surface-variant"
        />
      </div>
      <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-sm text-left min-w-[40rem]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-3 py-2 font-sans font-medium text-ink">Name</th>
              <th className="px-3 py-2 font-sans font-medium text-ink">Slug</th>
              <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                Functions
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                Published
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-outline-variant last:border-b-0"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/dashboard/places/${row.id}`}
                    className="text-umber hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-on-surface-variant font-mono text-xs">
                  {row.slug}
                </td>
                <td className="px-3 py-2 text-center tabular-nums">
                  {row.functionCount}
                </td>
                <td className="px-3 py-2 text-center">
                  <Tick on={row.is_published} />
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/dashboard/places/${row.id}`}
                    className="inline-flex items-center rounded border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-sans text-ink hover:bg-surface-variant transition-colors transition-duration-250 transition-timing-soft"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const DashboardPlacesIndex: NextPage<PageProps> = ({ rows }) => {
  return (
    <DashboardLayout>
      <div className="max-w-content">
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-6">
          Places
        </h1>
        <PlacesTable rows={rows} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPlacesIndex;

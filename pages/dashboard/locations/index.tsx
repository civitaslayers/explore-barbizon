import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type DashboardLocationRow = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean | null;
  show_in_editorial: boolean;
  is_featured: boolean | null;
  updated_at: string | null;
  category: string;
  layer: string;
};

type PageProps = { rows: DashboardLocationRow[] };

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const abs = Math.abs(diffSec);
  const sign = diffSec > 0 ? -1 : 1;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(sign * abs, "second");
  if (abs < 3600) return rtf.format(sign * Math.floor(abs / 60), "minute");
  if (abs < 86400) return rtf.format(sign * Math.floor(abs / 3600), "hour");
  if (abs < 604800) return rtf.format(sign * Math.floor(abs / 86400), "day");
  if (abs < 2592000) return rtf.format(sign * Math.floor(abs / 604800), "week");
  if (abs < 31536000) return rtf.format(sign * Math.floor(abs / 2592000), "month");
  return rtf.format(sign * Math.floor(abs / 31536000), "year");
}

function LayerChip({ layer }: { layer: string }) {
  if (layer === "Art & History") {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs text-cream bg-umber">
        {layer}
      </span>
    );
  }
  if (layer === "Eat, Stay & Shop") {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs text-cream bg-moss">
        {layer}
      </span>
    );
  }
  if (layer === "Forest & Nature") {
    return (
      <span
        className="inline-block rounded px-2 py-0.5 text-xs text-cream"
        style={{ backgroundColor: "#4A5E3A" }}
      >
        {layer}
      </span>
    );
  }
  if (layer === "Practical") {
    return (
      <span
        className="inline-block rounded px-2 py-0.5 text-xs text-cream"
        style={{ backgroundColor: "#888888" }}
      >
        {layer}
      </span>
    );
  }
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs bg-surface-variant text-on-surface-variant">
      {layer}
    </span>
  );
}

function Tick({ on }: { on: boolean }) {
  return <span className="text-on-surface-variant">{on ? "✓" : "—"}</span>;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  if (!supabase) {
    return { props: { rows: [] } };
  }

  const { data, error } = await supabase
    .from("locations")
    .select(
      "id, name, slug, is_published, show_in_editorial, is_featured, updated_at, categories!inner(name, layer)"
    );

  if (error || !data) {
    console.error("dashboard locations list", error?.message);
    return { props: { rows: [] } };
  }

  const rows: DashboardLocationRow[] = (data as {
    id: string;
    name: string;
    slug: string;
    is_published: boolean | null;
    show_in_editorial: boolean;
    is_featured: boolean | null;
    updated_at: string | null;
    categories: { name: string; layer: string };
  }[])
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      is_published: row.is_published,
      show_in_editorial: row.show_in_editorial,
      is_featured: row.is_featured,
      updated_at: row.updated_at,
      category: row.categories.name,
      layer: row.categories.layer,
    }))
    .sort((a, b) =>
      a.layer === b.layer
        ? a.category.localeCompare(b.category)
        : a.layer.localeCompare(b.layer)
    );

  return { props: { rows } };
};

function LocationsTable({ rows }: { rows: DashboardLocationRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(needle));
  }, [rows, q]);

  return (
    <>
      <div className="mb-4 max-w-md">
        <label className="sr-only" htmlFor="loc-filter">
          Filter by name
        </label>
        <input
          id="loc-filter"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name…"
          className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-ink placeholder:text-on-surface-variant"
        />
      </div>
      <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-sm text-left min-w-[56rem]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-3 py-2 font-sans font-medium text-ink">Name</th>
              <th className="px-3 py-2 font-sans font-medium text-ink">
                Category
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink">Layer</th>
              <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                Published
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                Editorial
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink text-center">
                Featured
              </th>
              <th className="px-3 py-2 font-sans font-medium text-ink">
                Last updated
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
                    href={`/dashboard/locations/${row.id}`}
                    className="text-umber hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-on-surface-variant">
                  {row.category}
                </td>
                <td className="px-3 py-2">
                  <LayerChip layer={row.layer} />
                </td>
                <td className="px-3 py-2 text-center">
                  <Tick on={Boolean(row.is_published)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <Tick on={row.show_in_editorial} />
                </td>
                <td className="px-3 py-2 text-center">
                  <Tick on={Boolean(row.is_featured)} />
                </td>
                <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                  {formatRelative(row.updated_at)}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/dashboard/locations/${row.id}`}
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

const DashboardLocationsIndex: NextPage<PageProps> = ({ rows }) => {
  return (
    <DashboardLayout>
      <div className="max-w-content">
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-6">
          Locations
        </h1>
        <LocationsTable rows={rows} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardLocationsIndex;

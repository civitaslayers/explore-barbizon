import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

const ESS_LAYER = "Eat, Stay & Shop";

type RecentRow = {
  id: string;
  name: string;
  is_published: boolean | null;
  updated_at: string | null;
  categories: { name: string } | null;
};

type DashboardOverviewProps = {
  publishedLocationCount: number;
  totalLocationCount: number;
  publishedStoryCount: number;
  publishedTourCount: number;
  featuredEssCount: number;
  recentLocations: RecentRow[];
};

export const getServerSideProps: GetServerSideProps<DashboardOverviewProps> =
  async () => {
    if (!supabase) {
      return {
        props: {
          publishedLocationCount: 0,
          totalLocationCount: 0,
          publishedStoryCount: 0,
          publishedTourCount: 0,
          featuredEssCount: 0,
          recentLocations: [],
        },
      };
    }

    const [pubLoc, totalLoc, pubStories, pubTours, essCats, recentRes] =
      await Promise.all([
      supabase
        .from("locations")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase.from("locations").select("id", { count: "exact", head: true }),
      supabase
        .from("stories")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase.from("categories").select("id").eq("layer", ESS_LAYER),
      supabase
        .from("locations")
        .select("id, name, is_published, updated_at, categories(name)")
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);

    const essIds = (essCats.data ?? []).map((c) => c.id);
    let featuredEss = 0;
    if (essIds.length > 0) {
      const { count } = await supabase
        .from("locations")
        .select("id", { count: "exact", head: true })
        .in("category_id", essIds)
        .eq("is_featured", true);
      featuredEss = count ?? 0;
    }

    return {
      props: {
        publishedLocationCount: pubLoc.count ?? 0,
        totalLocationCount: totalLoc.count ?? 0,
        publishedStoryCount: pubStories.count ?? 0,
        publishedTourCount: pubTours.count ?? 0,
        featuredEssCount: featuredEss,
        recentLocations: (recentRes.data ?? []) as RecentRow[],
      },
    };
  };

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-container-lowest rounded-card p-4 border border-outline-variant">
      <p className="font-serif italic text-3xl tracking-tight text-ink">
        {value}
      </p>
      <p className="text-sm text-on-surface-variant mt-2">{label}</p>
    </div>
  );
}

const DashboardOverview: NextPage<DashboardOverviewProps> = ({
  publishedLocationCount,
  totalLocationCount,
  publishedStoryCount,
  publishedTourCount,
  featuredEssCount,
  recentLocations,
}) => {
  return (
    <DashboardLayout>
      <div className="max-w-content">
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-6">
          Overview
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Published locations / Total locations"
            value={`${publishedLocationCount} / ${totalLocationCount}`}
          />
          <StatCard label="Published stories" value={publishedStoryCount} />
          <StatCard label="Published tours" value={publishedTourCount} />
          <StatCard label="Featured ESS locations" value={featuredEssCount} />
        </div>
        <div>
          <h2 className="text-sm font-sans text-on-surface-variant uppercase tracking-widest mb-3">
            Recently updated locations
          </h2>
          <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 font-sans font-medium text-ink">
                    Name
                  </th>
                  <th className="px-4 py-3 font-sans font-medium text-ink">
                    Category
                  </th>
                  <th className="px-4 py-3 font-sans font-medium text-ink">
                    Published
                  </th>
                  <th className="px-4 py-3 font-sans font-medium text-ink w-24">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLocations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-on-surface-variant"
                    >
                      No locations loaded. Check Supabase configuration.
                    </td>
                  </tr>
                ) : (
                  recentLocations.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-outline-variant last:border-b-0"
                    >
                      <td className="px-4 py-3 text-ink">{row.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {row.categories?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {row.is_published ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/locations/${row.id}`}
                          className="text-umber hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;

import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type PlaceDetail = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  short_description: string | null;
  historical_narrative: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
};

type PageProps = { place: PlaceDetail | null };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const id = params?.id;
  if (typeof id !== "string" || !supabase) {
    return { props: { place: null } };
  }

  const { data, error } = await supabase
    .from("places")
    .select(
      "id, name, slug, address, short_description, historical_narrative, seo_title, seo_description, is_published"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("dashboard place detail", error?.message);
    return { props: { place: null } };
  }

  return { props: { place: data as PlaceDetail } };
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | boolean;
}) {
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : (value ?? "—");
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-ink/90 whitespace-pre-wrap">{display}</dd>
    </div>
  );
}

const DashboardPlaceDetail: NextPage<PageProps> = ({ place }) => {
  return (
    <DashboardLayout>
      <div className="max-w-content">
        <p className="mb-4">
          <Link
            href="/dashboard/places"
            className="text-sm text-on-surface-variant hover:text-ink"
          >
            ← Places
          </Link>
        </p>
        {!place ? (
          <p className="text-on-surface-variant">Place not found.</p>
        ) : (
          <>
            <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-2">
              {place.name}
            </h1>
            <p className="mb-8 rounded border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Editor coming soon — fields below are read-only.
            </p>
            <dl className="grid gap-6 max-w-2xl">
              <Field label="ID" value={place.id} />
              <Field label="Slug" value={place.slug} />
              <Field label="Address" value={place.address} />
              <Field label="Short description" value={place.short_description} />
              <Field
                label="Historical narrative"
                value={place.historical_narrative}
              />
              <Field label="SEO title" value={place.seo_title} />
              <Field label="SEO description" value={place.seo_description} />
              <Field label="Published" value={place.is_published} />
            </dl>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPlaceDetail;

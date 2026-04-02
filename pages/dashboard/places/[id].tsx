import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type DashboardPlaceEditProps = {
  place: {
    id: string;
    slug: string;
    name: string;
    address: string | null;
    short_description: string | null;
    historical_narrative: string | null;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    is_published: boolean;
    show_on_map: boolean;
  } | null;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-sans uppercase tracking-widest text-on-surface-variant mb-1.5"
    >
      {children}
    </label>
  );
}

function PlaceEditorForm({
  place,
}: {
  place: NonNullable<DashboardPlaceEditProps["place"]>;
}) {
  const [name, setName] = useState(place.name);
  const [address, setAddress] = useState(place.address ?? "");
  const [shortDescription, setShortDescription] = useState(
    place.short_description ?? ""
  );
  const [historicalNarrative, setHistoricalNarrative] = useState(
    place.historical_narrative ?? ""
  );
  const [seoTitle, setSeoTitle] = useState(place.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    place.seo_description ?? ""
  );
  const [ogImageUrl, setOgImageUrl] = useState(place.og_image_url ?? "");
  const [isPublished, setIsPublished] = useState(Boolean(place.is_published));
  const [showOnMap, setShowOnMap] = useState(Boolean(place.show_on_map));

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveState("saving");
      setSaveMessage(null);

      const body = {
        name,
        address: address.trim() === "" ? null : address,
        short_description: shortDescription.trim() === "" ? null : shortDescription,
        historical_narrative:
          historicalNarrative.trim() === "" ? null : historicalNarrative,
        seo_title: seoTitle.trim() === "" ? null : seoTitle,
        seo_description:
          seoDescription.trim() === "" ? null : seoDescription,
        og_image_url: ogImageUrl.trim() === "" ? null : ogImageUrl,
        is_published: isPublished,
        show_on_map: showOnMap,
      };

      try {
        const res = await fetch(`/api/places/${place.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSaveState("error");
          setSaveMessage(
            typeof data.error === "string" ? data.error : "Save failed."
          );
          return;
        }
        setSaveState("success");
        setSaveMessage("Changes saved.");
      } catch {
        setSaveState("error");
        setSaveMessage("Network error while saving.");
      }
    },
    [
      address,
      historicalNarrative,
      isPublished,
      name,
      ogImageUrl,
      place.id,
      seoDescription,
      seoTitle,
      shortDescription,
      showOnMap,
    ]
  );

  const inputClass =
    "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-ink";

  return (
    <form onSubmit={onSubmit} className="max-w-measure space-y-6">
      <div>
        <FieldLabel htmlFor="place-name">Name</FieldLabel>
        <input
          id="place-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-address">Address</FieldLabel>
        <input
          id="place-address"
          className={inputClass}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-short">Short description</FieldLabel>
        <textarea
          id="place-short"
          rows={3}
          className={inputClass}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-historical">
          Historical narrative (Markdown)
        </FieldLabel>
        <textarea
          id="place-historical"
          rows={10}
          className={inputClass}
          value={historicalNarrative}
          onChange={(e) => setHistoricalNarrative(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-seo-title">SEO title</FieldLabel>
        <input
          id="place-seo-title"
          className={inputClass}
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-seo-desc">SEO description</FieldLabel>
        <textarea
          id="place-seo-desc"
          rows={3}
          className={inputClass}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="place-og">OG image URL</FieldLabel>
        <input
          id="place-og"
          className={inputClass}
          value={ogImageUrl}
          onChange={(e) => setOgImageUrl(e.target.value)}
        />
      </div>

      <fieldset className="space-y-3 border border-outline-variant rounded-card p-4 bg-surface-container-lowest">
        <legend className="text-xs font-sans uppercase tracking-widest text-on-surface-variant px-1">
          Visibility & flags
        </legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={showOnMap}
            onChange={(e) => setShowOnMap(e.target.checked)}
          />
          Show on map
        </label>
      </fieldset>

      {saveMessage ? (
        <p
          className={
            saveState === "error" ? "text-sm text-umber" : "text-sm text-moss"
          }
          role={saveState === "error" ? "alert" : "status"}
        >
          {saveMessage}
        </p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saveState === "saving"}
          className="rounded border border-umber bg-umber px-4 py-2 text-sm text-cream font-sans hover:opacity-90 disabled:opacity-50 transition-opacity transition-duration-250 transition-timing-soft"
        >
          {saveState === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardPlaceEditProps> =
  async (ctx) => {
    const id = ctx.params?.id;
    if (typeof id !== "string") {
      return { notFound: true };
    }
    if (!supabase) {
      return { props: { place: null } };
    }

    const { data, error } = await supabase
      .from("places")
      .select(
        "id, slug, name, address, short_description, historical_narrative, seo_title, seo_description, og_image_url, is_published, show_on_map"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { notFound: true };
    }

    const row = data as {
      id: string;
      slug: string;
      name: string;
      address: string | null;
      short_description: string | null;
      historical_narrative: string | null;
      seo_title: string | null;
      seo_description: string | null;
      og_image_url: string | null;
      is_published: boolean;
      show_on_map: boolean;
    };

    return {
      props: {
        place: {
          id: row.id,
          slug: row.slug,
          name: row.name,
          address: row.address,
          short_description: row.short_description,
          historical_narrative: row.historical_narrative,
          seo_title: row.seo_title,
          seo_description: row.seo_description,
          og_image_url: row.og_image_url,
          is_published: row.is_published,
          show_on_map: row.show_on_map,
        },
      },
    };
  };

const DashboardPlaceEdit: NextPage<DashboardPlaceEditProps> = ({ place }) => {
  if (!place) {
    return (
      <DashboardLayout>
        <p className="text-sm text-on-surface-variant">
          Database is not configured or this place could not be loaded.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-content">
        <Link
          href="/dashboard/places"
          className="text-sm text-on-surface-variant hover:text-ink mb-6 inline-block transition-colors transition-duration-250 transition-timing-soft"
        >
          ← Places
        </Link>
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-8">
          Edit place
        </h1>
        <PlaceEditorForm place={place} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPlaceEdit;

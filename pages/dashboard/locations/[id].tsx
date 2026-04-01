import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type DashboardLocationEditProps = {
  location: {
    id: string;
    slug: string;
    name: string;
    short_description: string | null;
    full_description: string | null;
    narrative: string | null;
    address: string | null;
    website: string | null;
    phone: string | null;
    latitude: number;
    longitude: number;
    is_published: boolean | null;
    show_in_editorial: boolean;
    show_on_map: boolean | null;
    is_featured: boolean | null;
    is_premium: boolean | null;
    curation_order: number | null;
    category_name: string;
    category_layer: string;
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

function LocationEditorForm({
  location,
}: {
  location: NonNullable<DashboardLocationEditProps["location"]>;
}) {
  const [name, setName] = useState(location.name);
  const [shortDescription, setShortDescription] = useState(
    location.short_description ?? ""
  );
  const [fullDescription, setFullDescription] = useState(
    location.full_description ?? ""
  );
  const [narrative, setNarrative] = useState(location.narrative ?? "");
  const [address, setAddress] = useState(location.address ?? "");
  const [website, setWebsite] = useState(location.website ?? "");
  const [phone, setPhone] = useState(location.phone ?? "");
  const [latitude, setLatitude] = useState(String(location.latitude));
  const [longitude, setLongitude] = useState(String(location.longitude));
  const [isPublished, setIsPublished] = useState(Boolean(location.is_published));
  const [showInEditorial, setShowInEditorial] = useState(
    location.show_in_editorial
  );
  const [showOnMap, setShowOnMap] = useState(Boolean(location.show_on_map));
  const [isFeatured, setIsFeatured] = useState(Boolean(location.is_featured));
  const [isPremium, setIsPremium] = useState(Boolean(location.is_premium));
  const [curationOrder, setCurationOrder] = useState(
    location.curation_order != null ? String(location.curation_order) : ""
  );

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveState("saving");
      setSaveMessage(null);

      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setSaveState("error");
        setSaveMessage("Latitude and longitude must be valid numbers.");
        return;
      }

      const curationNum =
        curationOrder.trim() === ""
          ? null
          : Number(curationOrder.trim());
      if (curationOrder.trim() !== "" && !Number.isFinite(curationNum)) {
        setSaveState("error");
        setSaveMessage("Curation order must be a number or empty.");
        return;
      }

      const body = {
        name,
        short_description: shortDescription,
        full_description: fullDescription,
        narrative,
        address,
        website,
        phone,
        latitude: lat,
        longitude: lng,
        is_published: isPublished,
        show_in_editorial: showInEditorial,
        show_on_map: showOnMap,
        is_featured: isFeatured,
        is_premium: isPremium,
        curation_order: curationNum,
      };

      try {
        const res = await fetch(`/api/locations/${location.id}`, {
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
      curationOrder,
      fullDescription,
      isFeatured,
      isPremium,
      isPublished,
      latitude,
      location.id,
      longitude,
      name,
      narrative,
      phone,
      shortDescription,
      showInEditorial,
      showOnMap,
      website,
    ]
  );

  const inputClass =
    "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-ink";

  return (
    <form onSubmit={onSubmit} className="max-w-measure space-y-6">
      <div>
        <FieldLabel htmlFor="loc-name">Name</FieldLabel>
        <input
          id="loc-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-slug">Slug (read only)</FieldLabel>
        <input
          id="loc-slug"
          className={`${inputClass} bg-surface-container-low text-on-surface-variant`}
          value={location.slug}
          readOnly
        />
      </div>
      <p className="text-xs text-on-surface-variant">
        Category: {location.category_name}{" "}
        <span className="text-outline-variant">·</span> {location.category_layer}
      </p>

      <div>
        <FieldLabel htmlFor="loc-short">Short description</FieldLabel>
        <textarea
          id="loc-short"
          className={`${inputClass} min-h-[5rem]`}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-full">Full description</FieldLabel>
        <textarea
          id="loc-full"
          className={`${inputClass} min-h-[8rem]`}
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-narrative">Narrative</FieldLabel>
        <textarea
          id="loc-narrative"
          className={`${inputClass} min-h-[8rem]`}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-address">Address</FieldLabel>
        <input
          id="loc-address"
          className={inputClass}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-website">Website</FieldLabel>
        <input
          id="loc-website"
          type="text"
          className={inputClass}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="loc-phone">Phone</FieldLabel>
        <input
          id="loc-phone"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="loc-lat">Latitude</FieldLabel>
          <input
            id="loc-lat"
            type="text"
            inputMode="decimal"
            className={inputClass}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="loc-lng">Longitude</FieldLabel>
          <input
            id="loc-lng"
            type="text"
            inputMode="decimal"
            className={inputClass}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
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
            checked={showInEditorial}
            onChange={(e) => setShowInEditorial(e.target.checked)}
          />
          Show in editorial
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
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-outline-variant"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
          />
          Premium
        </label>
        <div>
          <FieldLabel htmlFor="loc-curation">Curation order</FieldLabel>
          <input
            id="loc-curation"
            type="text"
            inputMode="numeric"
            className={inputClass}
            value={curationOrder}
            onChange={(e) => setCurationOrder(e.target.value)}
            placeholder="Optional"
          />
        </div>
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

export const getServerSideProps: GetServerSideProps<DashboardLocationEditProps> =
  async (ctx) => {
    const id = ctx.params?.id;
    if (typeof id !== "string") {
      return { notFound: true };
    }
    if (!supabase) {
      return { props: { location: null } };
    }

    const { data, error } = await supabase
      .from("locations")
      .select(
        "id, slug, name, short_description, full_description, narrative, address, website, phone, latitude, longitude, is_published, show_in_editorial, show_on_map, is_featured, is_premium, curation_order, categories(name, layer)"
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
      short_description: string | null;
      full_description: string | null;
      narrative: string | null;
      address: string | null;
      website: string | null;
      phone: string | null;
      latitude: number;
      longitude: number;
      is_published: boolean | null;
      show_in_editorial: boolean;
      show_on_map: boolean | null;
      is_featured: boolean | null;
      is_premium: boolean | null;
      curation_order: number | null;
      categories: { name: string; layer: string } | null;
    };

    return {
      props: {
        location: {
          id: row.id,
          slug: row.slug,
          name: row.name,
          short_description: row.short_description,
          full_description: row.full_description,
          narrative: row.narrative,
          address: row.address,
          website: row.website,
          phone: row.phone,
          latitude: row.latitude,
          longitude: row.longitude,
          is_published: row.is_published,
          show_in_editorial: row.show_in_editorial,
          show_on_map: row.show_on_map,
          is_featured: row.is_featured,
          is_premium: row.is_premium,
          curation_order: row.curation_order,
          category_name: row.categories?.name ?? "—",
          category_layer: row.categories?.layer ?? "—",
        },
      },
    };
  };

const DashboardLocationEdit: NextPage<DashboardLocationEditProps> = ({
  location,
}) => {
  if (!location) {
    return (
      <DashboardLayout>
        <p className="text-sm text-on-surface-variant">
          Database is not configured or this location could not be loaded.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-content">
        <Link
          href="/dashboard/locations"
          className="text-sm text-on-surface-variant hover:text-ink mb-6 inline-block transition-colors transition-duration-250 transition-timing-soft"
        >
          ← Back to locations
        </Link>
        <h1 className="font-serif italic text-2xl tracking-tight text-ink mb-8">
          Edit location
        </h1>
        <LocationEditorForm location={location} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardLocationEdit;

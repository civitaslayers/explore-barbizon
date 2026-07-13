import type { GetServerSideProps, NextPage } from "next";
import type { MouseEvent, ReactElement, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import { CompletenessBadge } from "@/components/command-center/CompletenessBadge";
import { FichePositionMap } from "@/components/command-center/fiche/FichePositionMap";
import { IdentitySection } from "@/components/command-center/fiche/IdentitySection";
import { ContentSection } from "@/components/command-center/fiche/ContentSection";
import { PracticalSection } from "@/components/command-center/fiche/PracticalSection";
import { FlagsSection } from "@/components/command-center/fiche/FlagsSection";
import { PublishBlock } from "@/components/command-center/fiche/PublishBlock";
import { MediaStrip } from "@/components/command-center/fiche/MediaStrip";
import { InternalNotesSection } from "@/components/command-center/fiche/InternalNotesSection";
import { EditHistoryPanel } from "@/components/command-center/fiche/EditHistoryPanel";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { computeCompleteness, type MissingField } from "@/lib/completeness";
import { getCategoryGroup } from "@/lib/categoryGroups";
import type { OpeningHoursObject } from "@/lib/openingHours";
import type { FicheLocation, FicheCategoryOption } from "@/lib/atlasTypes";

// ---------------------------------------------------------------------------
// La Fiche — docs/ccc-v3-phase2-implementation-plan.md item 11 /
// docs/ccc-v3-fiche-plan.md Section 3. Full-record editor for one location.
// Every write goes through the extended PATCH /api/locations/[id] — no
// client-direct Supabase writes. No form library (Section 3.0): plain
// useState + a manual dirty-diff against a loaded snapshot.
// ---------------------------------------------------------------------------

type NextPageWithLayout<P> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type FicheProps = {
  location: FicheLocation;
  categories: FicheCategoryOption[];
  townLabel: string;
  // slug -> id across the whole atlas, for the position map's proximity-
  // override neighbour resolution (see FichePositionMap's `resolveNeighborId`
  // doc comment for why this is needed).
  slugToId: Record<string, string>;
};

const ACCOMMODATION_CATEGORY_NAMES = new Set(["Hotel", "Chambre d'hôtes"]);

const MISSING_FIELD_LABEL_FR: Record<MissingField, string> = {
  photo: "photo",
  description: "description courte",
  body: "texte",
  address: "adresse",
  hours: "horaires",
  website: "site web",
  phone: "téléphone",
  category: "catégorie",
};

// ---------------------------------------------------------------------------
// getServerSideProps — supabaseAdmin is referenced ONLY inside this function.
// ---------------------------------------------------------------------------

type FicheLocationRow = {
  id: string;
  town_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  narrative: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  booking_url: string | null;
  opening_hours: Record<string, unknown> | null;
  latitude: number;
  longitude: number;
  allow_proximity_override: boolean | null;
  is_published: boolean | null;
  show_on_map: boolean | null;
  show_in_editorial: boolean | null;
  is_featured: boolean | null;
  is_premium: boolean | null;
  curation_order: number | null;
  qr_code_url: string | null;
  internal_notes: string | null;
  categories: { name: string; layer: string } | null;
  towns: { name: string } | null;
  media: { url: string; caption: string | null; display_order: number | null }[] | null;
  location_functions:
    | {
        website: string | null;
        phone: string | null;
        opening_hours: Record<string, unknown> | null;
      }[]
    | null;
};

type CategoryRow = { id: string; name: string; layer: string };

function nonEmpty(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0;
}

function hasAnyHours(value: Record<string, unknown> | null | undefined): boolean {
  if (!value) return false;
  return Object.values(value).some((v) => typeof v === "string" && v.trim().length > 0);
}

export const getServerSideProps: GetServerSideProps<FicheProps> = async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true };

  const { data, error } = await supabaseAdmin
    .from("locations")
    .select(
      "id, town_id, category_id, name, slug, short_description, full_description, narrative, " +
        "address, phone, website, booking_url, opening_hours, latitude, longitude, " +
        "allow_proximity_override, is_published, show_on_map, show_in_editorial, is_featured, " +
        "is_premium, curation_order, qr_code_url, internal_notes, " +
        "categories(name, layer), towns(name), " +
        "media(url, caption, display_order), " +
        "location_functions(website, phone, opening_hours)"
    )
    .eq("id", id)
    .maybeSingle<FicheLocationRow>();

  if (error || !data) return { notFound: true };

  const { data: categoriesData } = await supabaseAdmin
    .from("categories")
    .select("id, name, layer")
    .order("display_order", { ascending: true })
    .overrideTypes<CategoryRow[]>();

  const { data: slugRows } = await supabaseAdmin
    .from("locations")
    .select("id, slug")
    .overrideTypes<{ id: string; slug: string }[]>();

  const categoryName = data.categories?.name ?? "Point of Interest";
  const categoryLayer = data.categories?.layer ?? "—";
  const group = getCategoryGroup(categoryName, categoryLayer);

  const functions = data.location_functions ?? [];

  const location: FicheLocation = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    townId: data.town_id,
    categoryId: data.category_id,
    categoryName,
    layer: categoryLayer,
    group,
    shortDescription: data.short_description,
    fullDescription: data.full_description,
    narrative: data.narrative,
    address: data.address,
    phone: data.phone,
    website: data.website,
    bookingUrl: data.booking_url,
    openingHours: data.opening_hours,
    latitude: data.latitude,
    longitude: data.longitude,
    allowProximityOverride: data.allow_proximity_override ?? false,
    isPublished: data.is_published ?? false,
    showOnMap: data.show_on_map ?? false,
    showInEditorial: data.show_in_editorial ?? false,
    isFeatured: data.is_featured ?? false,
    isPremium: data.is_premium ?? false,
    curationOrder: data.curation_order,
    qrCodeUrl: data.qr_code_url,
    internalNotes: data.internal_notes,
    media: (data.media ?? []).map((m) => ({
      url: m.url,
      caption: m.caption,
      displayOrder: m.display_order,
    })),
    functionWebsite: functions.some((fn) => nonEmpty(fn.website)),
    functionPhone: functions.some((fn) => nonEmpty(fn.phone)),
    functionHours: functions.some((fn) => hasAnyHours(fn.opening_hours)),
  };

  const categories: FicheCategoryOption[] = (categoriesData ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    layer: c.layer,
  }));

  const slugToId: Record<string, string> = {};
  for (const row of slugRows ?? []) {
    slugToId[row.slug] = row.id;
  }

  return {
    props: {
      location,
      categories,
      townLabel: data.towns?.name ?? "—",
      slugToId,
    },
  };
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type SaveState = "idle" | "saving" | "success" | "error";

const FichePage: NextPageWithLayout<FicheProps> = ({
  location,
  categories,
  townLabel,
  slugToId,
}) => {
  const router = useRouter();
  const backView = typeof router.query.from === "string" ? router.query.from : "map";
  const backHref = `/command-center/atlas?view=${backView === "list" ? "list" : "map"}`;

  // ---- Snapshot (the loaded/last-saved truth) + editable field state ------
  const [snapshot, setSnapshot] = useState<FicheLocation>(location);

  const [name, setName] = useState(location.name);
  const [shortDescription, setShortDescription] = useState(location.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(location.fullDescription ?? "");
  const [narrative, setNarrative] = useState(location.narrative ?? "");
  const [address, setAddress] = useState(location.address ?? "");
  const [phone, setPhone] = useState(location.phone ?? "");
  const [website, setWebsite] = useState(location.website ?? "");
  const [bookingUrl, setBookingUrl] = useState(location.bookingUrl ?? "");
  const [openingHours, setOpeningHours] = useState<OpeningHoursObject | null>(
    location.openingHours
  );
  const [categoryId, setCategoryId] = useState(location.categoryId ?? "");
  const [showInEditorial, setShowInEditorial] = useState(location.showInEditorial);
  const [showOnMap, setShowOnMap] = useState(location.showOnMap);
  const [isFeatured, setIsFeatured] = useState(location.isFeatured);
  const [isPremium, setIsPremium] = useState(location.isPremium);
  const [curationOrder, setCurationOrder] = useState(
    location.curationOrder != null ? String(location.curationOrder) : ""
  );
  const [qrCodeUrl, setQrCodeUrl] = useState(location.qrCodeUrl ?? "");
  const [internalNotes, setInternalNotes] = useState(location.internalNotes ?? "");

  // Position, proximity flag, and publish state write IMMEDIATELY through
  // their own dedicated UI (FichePositionMap / PublishBlock) — they are
  // deliberately NOT part of the generic changed-fields Save below, so
  // publishing is never accidentally bundled with an unrelated edit sitting
  // in the dirty-set (locked decision 3), and position writes keep their own
  // drag/proximity confirm flow (fiche-plan §3.2).
  const [latitude, setLatitude] = useState(location.latitude);
  const [longitude, setLongitude] = useState(location.longitude);
  const [allowProximityOverride, setAllowProximityOverride] = useState(
    location.allowProximityOverride
  );
  const [isPublished, setIsPublished] = useState(location.isPublished);
  const [publishBusy, setPublishBusy] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const bumpHistoryRefresh = useCallback(() => setHistoryRefresh((n) => n + 1), []);

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const currentCategoryName = selectedCategory?.name ?? location.categoryName;
  const currentLayer = selectedCategory?.layer ?? location.layer;
  const currentGroup = getCategoryGroup(currentCategoryName, currentLayer);
  const showBookingUrl = ACCOMMODATION_CATEGORY_NAMES.has(currentCategoryName);

  // ---- Dirty-diff (generic Save fields only) -------------------------------
  const dirtyKeys = useMemo(() => {
    const keys: string[] = [];
    if (name !== snapshot.name) keys.push("name");
    if (shortDescription !== (snapshot.shortDescription ?? "")) keys.push("short_description");
    if (fullDescription !== (snapshot.fullDescription ?? "")) keys.push("full_description");
    if (narrative !== (snapshot.narrative ?? "")) keys.push("narrative");
    if (address !== (snapshot.address ?? "")) keys.push("address");
    if (phone !== (snapshot.phone ?? "")) keys.push("phone");
    if (website !== (snapshot.website ?? "")) keys.push("website");
    if (bookingUrl !== (snapshot.bookingUrl ?? "")) keys.push("booking_url");
    if (JSON.stringify(openingHours ?? {}) !== JSON.stringify(snapshot.openingHours ?? {})) {
      keys.push("opening_hours");
    }
    if (categoryId !== (snapshot.categoryId ?? "")) keys.push("category_id");
    if (showInEditorial !== snapshot.showInEditorial) keys.push("show_in_editorial");
    if (showOnMap !== snapshot.showOnMap) keys.push("show_on_map");
    if (isFeatured !== snapshot.isFeatured) keys.push("is_featured");
    if (isPremium !== snapshot.isPremium) keys.push("is_premium");
    const snapshotCuration =
      snapshot.curationOrder != null ? String(snapshot.curationOrder) : "";
    if (curationOrder !== snapshotCuration) keys.push("curation_order");
    if (qrCodeUrl !== (snapshot.qrCodeUrl ?? "")) keys.push("qr_code_url");
    if (internalNotes !== (snapshot.internalNotes ?? "")) keys.push("internal_notes");
    return keys;
  }, [
    name,
    shortDescription,
    fullDescription,
    narrative,
    address,
    phone,
    website,
    bookingUrl,
    openingHours,
    categoryId,
    showInEditorial,
    showOnMap,
    isFeatured,
    isPremium,
    curationOrder,
    qrCodeUrl,
    internalNotes,
    snapshot,
  ]);

  const isDirty = dirtyKeys.length > 0;

  // ---- Unsaved-changes guard (Feature 3) -----------------------------------
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    router.beforePopState(() => {
      if (isDirty) {
        return window.confirm(
          "Modifications non enregistrées — quitter quand même ?"
        );
      }
      return true;
    });
    return () => {
      router.beforePopState(() => true);
    };
  }, [isDirty, router]);

  const guardedNavClick = useCallback(
    (e: MouseEvent) => {
      if (isDirty && !window.confirm("Modifications non enregistrées — quitter quand même ?")) {
        e.preventDefault();
      }
    },
    [isDirty]
  );

  // ---- Live completeness ----------------------------------------------------
  const completeness = useMemo(
    () =>
      computeCompleteness(
        {
          category_id: categoryId || null,
          short_description: shortDescription,
          full_description: fullDescription,
          narrative,
          address,
          // completeness.ts's hasOpeningHours only inspects string values —
          // safe for object-shaped legacy entries (finding 1), which simply
          // don't count toward "has hours" until normalized/edited.
          opening_hours: openingHours as Record<string, string> | null,
          website,
          phone,
        },
        {
          group: currentGroup,
          mediaCount: location.media.length,
          functionWebsite: location.functionWebsite,
          functionPhone: location.functionPhone,
          functionHours: location.functionHours,
        }
      ),
    [
      categoryId,
      shortDescription,
      fullDescription,
      narrative,
      address,
      openingHours,
      website,
      phone,
      currentGroup,
      location.media.length,
      location.functionWebsite,
      location.functionPhone,
      location.functionHours,
    ]
  );

  const missingFieldLabels = completeness.missing.map((f) => MISSING_FIELD_LABEL_FR[f]);

  // ---- Save (changed-fields-only) ------------------------------------------
  const handleSave = useCallback(async () => {
    if (dirtyKeys.length === 0) return;
    if (name.trim().length === 0) {
      setSaveState("error");
      setSaveMessage("Le nom ne peut pas être vide.");
      return;
    }
    let curationValue: number | null = null;
    if (dirtyKeys.includes("curation_order")) {
      const trimmed = curationOrder.trim();
      if (trimmed !== "") {
        const n = Number(trimmed);
        if (!Number.isFinite(n)) {
          setSaveState("error");
          setSaveMessage("L'ordre de curation doit être un nombre ou vide.");
          return;
        }
        curationValue = n;
      }
    }

    setSaveState("saving");
    setSaveMessage(null);

    const payload: Record<string, unknown> = {
      source_page: "/command-center/atlas/[id]",
    };
    const fieldValues: Record<string, unknown> = {
      name,
      short_description: shortDescription,
      full_description: fullDescription,
      narrative,
      address,
      phone,
      website,
      booking_url: bookingUrl,
      opening_hours: openingHours ?? {},
      category_id: categoryId || null,
      show_in_editorial: showInEditorial,
      show_on_map: showOnMap,
      is_featured: isFeatured,
      is_premium: isPremium,
      curation_order: curationValue,
      qr_code_url: qrCodeUrl,
      internal_notes: internalNotes,
    };
    for (const key of dirtyKeys) {
      payload[key] = fieldValues[key];
    }

    try {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: `Réponse non-JSON du serveur (HTTP ${res.status})` };
      }
      if (!res.ok) {
        setSaveState("error");
        setSaveMessage(
          typeof data.error === "string" ? data.error : "Échec de l'enregistrement."
        );
        return;
      }
      // Reset the snapshot to the just-saved values so the dirty-diff clears.
      setSnapshot((prev) => ({
        ...prev,
        name,
        shortDescription,
        fullDescription,
        narrative,
        address,
        phone,
        website,
        bookingUrl,
        openingHours,
        categoryId: categoryId || null,
        showInEditorial,
        showOnMap,
        isFeatured,
        isPremium,
        curationOrder: curationValue !== null ? curationValue : prev.curationOrder,
        qrCodeUrl,
        internalNotes,
      }));
      setSaveState("success");
      setSaveMessage("Modifications enregistrées.");
      bumpHistoryRefresh();
    } catch (err) {
      setSaveState("error");
      setSaveMessage(
        `Erreur réseau : ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [
    dirtyKeys,
    name,
    shortDescription,
    fullDescription,
    narrative,
    address,
    phone,
    website,
    bookingUrl,
    openingHours,
    categoryId,
    showInEditorial,
    showOnMap,
    isFeatured,
    isPremium,
    curationOrder,
    qrCodeUrl,
    internalNotes,
    location.id,
    bumpHistoryRefresh,
  ]);

  // ---- Position (immediate write via FichePositionMap) ----------------------
  const handlePositionCommitted = useCallback(
    (lat: number, lng: number) => {
      setLatitude(lat);
      setLongitude(lng);
      bumpHistoryRefresh();
    },
    [bumpHistoryRefresh]
  );

  const resolveNeighborId = useCallback(
    (slug: string) => slugToId[slug] ?? null,
    [slugToId]
  );

  // ---- Publish / unpublish (immediate single-field write, own human gate) ---
  const patchSingleField = useCallback(
    async (field: string, value: unknown) => {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value, source_page: "/command-center/atlas/[id]" }),
      });
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: `Réponse non-JSON du serveur (HTTP ${res.status})` };
      }
      return { ok: res.ok, status: res.status, data };
    },
    [location.id]
  );

  const handlePublish = useCallback(async () => {
    setPublishBusy(true);
    try {
      const res = await patchSingleField("is_published", true);
      if (!res.ok) {
        setToast({
          kind: "error",
          message:
            typeof res.data.error === "string"
              ? res.data.error
              : "Échec de la publication.",
        });
        return;
      }
      setIsPublished(true);
      setToast({ kind: "success", message: `${location.name} est maintenant publié.` });
      bumpHistoryRefresh();
    } catch (err) {
      setToast({
        kind: "error",
        message: `Échec : ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setPublishBusy(false);
    }
  }, [patchSingleField, location.name, bumpHistoryRefresh]);

  const handleUnpublish = useCallback(async () => {
    setPublishBusy(true);
    try {
      const res = await patchSingleField("is_published", false);
      if (!res.ok) {
        setToast({
          kind: "error",
          message:
            typeof res.data.error === "string" ? res.data.error : "Échec de la dépublication.",
        });
        return;
      }
      setIsPublished(false);
      bumpHistoryRefresh();
    } catch (err) {
      setToast({
        kind: "error",
        message: `Échec : ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setPublishBusy(false);
    }
  }, [patchSingleField, bumpHistoryRefresh]);

  return (
    <div className="min-h-screen">
      {/* Persistent live-write banner — carries over from the Atlas index /
          pins.tsx (this surface writes production with no sandbox). */}
      <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-umber px-4 py-2 text-cream shadow-sm">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-cream" />
        <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
          Écriture directe en production
          <span className="ml-2 font-normal normal-case tracking-normal text-cream/70">
            · writes live data — no sandbox
          </span>
        </p>
      </div>

      {/* Sticky header */}
      <div className="sticky top-[33px] z-20 flex items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            onClick={guardedNavClick}
            className="shrink-0 text-xs uppercase tracking-[0.15em] text-ink/45 no-underline hover:text-ink"
          >
            ← Atlas
          </Link>
          <p className="heading-lg truncate">{name || location.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CompletenessBadge score={completeness.score} band={completeness.band} showLabel />
          {isDirty ? (
            <span className="text-[10px] uppercase tracking-[0.15em] text-umber">
              non enregistré
            </span>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isDirty || saveState === "saving"}
          >
            {saveState === "saving" ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {saveMessage ? (
        <p
          className={`px-6 pt-3 text-sm ${saveState === "error" ? "text-umber" : "text-moss"}`}
          role={saveState === "error" ? "alert" : "status"}
        >
          {saveMessage}
        </p>
      ) : null}
      {toast ? (
        <p
          className={`px-6 pt-3 text-sm ${toast.kind === "error" ? "text-umber" : "text-moss"}`}
          role={toast.kind === "error" ? "alert" : "status"}
        >
          {toast.message}
        </p>
      ) : null}

      <div className="mx-auto max-w-content space-y-6 px-6 py-8">
        <IdentitySection
          name={name}
          onNameChange={setName}
          slug={location.slug}
          townLabel={townLabel}
          categoryId={categoryId || null}
          categories={categories}
          onCategoryChange={setCategoryId}
        />

        <section className="space-y-4 rounded-card bg-surface-container-low p-6">
          <h2 className="font-serif text-lg italic tracking-tight text-ink">Position</h2>
          <FichePositionMap
            locationId={location.id}
            name={name || location.name}
            latitude={latitude}
            longitude={longitude}
            allowProximityOverride={allowProximityOverride}
            resolveNeighborId={resolveNeighborId}
            onCommitted={handlePositionCommitted}
          />
        </section>

        <ContentSection
          shortDescription={shortDescription}
          onShortDescriptionChange={setShortDescription}
          fullDescription={fullDescription}
          onFullDescriptionChange={setFullDescription}
          narrative={narrative}
          onNarrativeChange={setNarrative}
        />

        <PracticalSection
          address={address}
          onAddressChange={setAddress}
          phone={phone}
          onPhoneChange={setPhone}
          website={website}
          onWebsiteChange={setWebsite}
          bookingUrl={bookingUrl}
          onBookingUrlChange={setBookingUrl}
          showBookingUrl={showBookingUrl}
          openingHours={openingHours}
          onOpeningHoursChange={setOpeningHours}
        />

        <FlagsSection
          showInEditorial={showInEditorial}
          onShowInEditorialChange={setShowInEditorial}
          showOnMap={showOnMap}
          onShowOnMapChange={setShowOnMap}
          isFeatured={isFeatured}
          onIsFeaturedChange={setIsFeatured}
          isPremium={isPremium}
          onIsPremiumChange={setIsPremium}
          curationOrder={curationOrder}
          onCurationOrderChange={setCurationOrder}
          qrCodeUrl={qrCodeUrl}
          onQrCodeUrlChange={setQrCodeUrl}
        />

        <PublishBlock
          name={name || location.name}
          categoryName={currentCategoryName}
          showOnMap={showOnMap}
          showInEditorial={showInEditorial}
          missingFieldLabels={missingFieldLabels}
          isPublished={isPublished}
          busy={publishBusy}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />

        <MediaStrip media={location.media} />

        <InternalNotesSection
          internalNotes={internalNotes}
          onInternalNotesChange={setInternalNotes}
        />

        <EditHistoryPanel locationId={location.id} refreshSignal={historyRefresh} />
      </div>
    </div>
  );
};

FichePage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default FichePage;

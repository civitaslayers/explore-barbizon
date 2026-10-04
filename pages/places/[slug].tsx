import Image from "next/image";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation, type SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import type { ReactNode } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import {
  getLocationFull,
  getPublishedLocationSlugs,
  type LocationFull,
  type LocationFunction,
} from "@/lib/supabase";
import { buildPlaceSchema } from "@/lib/seo";
import { getLocalized, hasPublishedTranslation } from "@/lib/getLocalized";
import { SeoHead } from "@/components/SeoHead";
import nextI18NextConfig from "@/next-i18next.config";
import {
  DAY_KEYS,
  DAY_LABEL_KEYS,
  NON_DAY_LABEL_KEYS,
  formatHoursValueKey,
  splitOpeningHours,
} from "@/lib/openingHours";

function functionChipClasses(layer: string | null | undefined): string {
  if (layer === "Art & History") return "bg-umber/10 text-umber";
  if (layer === "Eat, Stay & Shop") return "bg-moss/10 text-moss";
  if (layer === "Forest & Nature") return "bg-forest/10 text-forest";
  return "bg-ink/8 text-ink/50";
}

function UnifiedPlaceArticle({
  place,
  locale,
}: {
  place: LocationFull;
  locale: string;
}) {
  const { t } = useTranslation("common");
  const heroImage = place.heroImage;
  const name = getLocalized(place, locale, "name") || place.name;
  const localizedNarrative = getLocalized(place, locale, "narrative");
  const narrativeParagraphs =
    (localizedNarrative || place.narrative || "")
      .split(/\n\n/)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];

  return (
    <article className="space-y-14 md:space-y-20 lg:space-y-24 xl:space-y-28">
      <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink/40">
        <Link
          href="/places"
          className="no-underline transition-colors duration-200 hover:text-ink"
        >
          ← {t("actions.backToPlaces")}
        </Link>
      </p>

      <header className="overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-card md:rounded-[1.75rem]">
        <div className="relative h-[17rem] sm:h-72 md:h-[22rem] lg:h-[26rem] xl:h-[30rem]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-[0.78]"
            />
          ) : (
            <ImagePlaceholder name={name} className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/25">
            <div className="fade-in-hero relative z-10 flex h-full flex-col justify-end p-6 md:p-9 lg:p-11 xl:p-14">
              <div className="max-w-3xl space-y-4 text-cream xl:max-w-[40rem]">
                <h1 className="font-serif text-[2.2rem] italic leading-[1.0] tracking-tight text-cream md:text-[3rem] lg:text-[3.5rem]">
                  {name}
                </h1>
                {place.address ? (
                  <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cream/65">
                    {place.address}
                  </p>
                ) : null}
                {place.functions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {place.functions.map((fn) => (
                      <span
                        key={fn.id}
                        className={`inline-block rounded-full px-3 py-1 font-sans text-[11px] uppercase tracking-[0.14em] ${functionChipClasses(fn.category?.layer)}`}
                      >
                        {fn.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        </div>
      </header>

      {narrativeParagraphs.length > 0 ? (
        <HistorySection paragraphs={narrativeParagraphs} />
      ) : null}

      {place.functions.map((fn) => (
        <FunctionSection key={fn.id} fn={fn} />
      ))}

      <LocationHoursSection hours={place.opening_hours} />
    </article>
  );
}

function HistorySection({ paragraphs }: { paragraphs: string[] }) {
  const { t } = useTranslation("common");
  return (
    <section className="border-t border-ink/10 pt-12 md:pt-14 lg:pt-16">
      <div className="editorial-measure space-y-6">
        <p className="eyebrow">{t("place.narrativeEyebrow")}</p>
        <div className="space-y-5 text-sm leading-[1.85] text-ink/88 md:text-base md:leading-[1.88] xl:text-[1.0625rem] xl:leading-[1.85]">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function practicalBlock(
  fn: LocationFunction,
  t: (key: string) => string
): ReactNode {
  const hasWebsite = Boolean(fn.website?.trim());
  const hasPhone = Boolean(fn.phone?.trim());
  const hoursEntries = fn.opening_hours
    ? Object.entries(fn.opening_hours).filter(
        ([, v]) => v != null && String(v).trim() !== ""
      )
    : [];
  const hasHours = hoursEntries.length > 0;
  if (!hasWebsite && !hasPhone && !hasHours) return null;

  return (
    <dl className="mt-8 grid gap-4 border-t border-ink/10 pt-8 text-xs leading-relaxed md:grid-cols-2 md:gap-x-8">
      {hasWebsite ? (
        <div>
          <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
            {t("place.website")}
          </dt>
          <dd className="mt-1.5">
            <a
              href={fn.website!.startsWith("http") ? fn.website! : `https://${fn.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-umber underline underline-offset-2 hover:text-ink"
            >
              {t("actions.visitWebsite")} →
            </a>
          </dd>
        </div>
      ) : null}
      {hasPhone ? (
        <div>
          <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
            <span aria-hidden className="mr-1">
              ☎
            </span>
            {t("place.phone")}
          </dt>
          <dd className="mt-1.5 font-serif text-sm text-ink/90">{fn.phone}</dd>
        </div>
      ) : null}
      {hasHours ? (
        <div className="md:col-span-2">
          <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
            {t("place.openingHours")}
          </dt>
          <dd className="mt-2">
            <dl className="grid gap-2 sm:grid-cols-2">
              {hoursEntries.map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4 border-b border-ink/5 pb-2 last:border-0">
                  <dt className="text-ink/70">{day}</dt>
                  <dd className="text-right text-ink/90 tabular-nums">
                    {String(hours)}
                  </dd>
                </div>
              ))}
            </dl>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function FunctionSection({ fn }: { fn: LocationFunction }) {
  const { t } = useTranslation("common");
  return (
    <section className="border-t border-ink/10 pt-12 md:pt-14 lg:pt-16">
      <div className="editorial-measure">
        <p className="eyebrow">{fn.label}</p>
        {fn.description ? (
          <div className="mt-6 space-y-5 text-sm leading-[1.72] text-ink/88 md:text-base md:leading-[1.75] xl:text-[1.0625rem] xl:leading-[1.72]">
            <p>{fn.description}</p>
          </div>
        ) : null}
        {practicalBlock(fn, t)}
      </div>
    </section>
  );
}

// Venue-level hours (locations.opening_hours) — distinct from per-function
// hours (location_functions.opening_hours, rendered above via
// practicalBlock). Kept visually distinct so a multi-service venue does not
// look like its hours are duplicated. Display-normalizes via
// lib/openingHours so this renders correctly whether or not the 16-row
// normalization migration has run, and never drops an object-valued or
// unrecognized key (see lib/openingHours.ts findings 1–2).
function LocationHoursSection({
  hours,
}: {
  hours: Record<string, unknown> | null;
}) {
  const { t } = useTranslation("common");
  if (!hours) return null;
  const { days, others } = splitOpeningHours(hours);
  const dayRows = DAY_KEYS.filter((d) => days[d].trim().length > 0);
  if (dayRows.length === 0 && others.length === 0) return null;

  // "default" is a catch-all non-day key (see lib/openingHours.ts). When it's
  // the ONLY thing to show, a label ("Habituellement"/"Usually") reads as
  // noise next to a single value — render the hours bare. The label earns
  // its place only when it needs to distinguish "default" from other rows
  // (day rows, check_in/check_out, etc).
  const isDefaultOnly =
    dayRows.length === 0 && others.length === 1 && others[0].key === "default";

  return (
    <section className="border-t border-ink/10 pt-12 md:pt-14 lg:pt-16">
      <div className="editorial-measure">
        <p className="eyebrow">{t("place.openingHours")}</p>
        <dl className="mt-6 grid gap-2 text-xs leading-relaxed sm:grid-cols-2">
          {dayRows.map((d) => (
            <div
              key={d}
              className="flex justify-between gap-4 border-b border-ink/5 pb-2 last:border-0"
            >
              <dt className="text-ink/70">{t(DAY_LABEL_KEYS[d])}</dt>
              <dd className="text-right text-ink/90 tabular-nums">
                {days[d]}
              </dd>
            </div>
          ))}
          {others.map((entry) => {
            const labelKey = NON_DAY_LABEL_KEYS[entry.key];
            const valueKey = formatHoursValueKey(entry.raw);
            const hideLabel = isDefaultOnly && entry.key === "default";
            return (
              <div
                key={entry.key}
                className="flex justify-between gap-4 border-b border-ink/5 pb-2 last:border-0"
              >
                {!hideLabel && (
                  <dt className="text-ink/70">
                    {labelKey ? t(labelKey) : entry.key}
                  </dt>
                )}
                <dd
                  className={
                    hideLabel
                      ? "text-ink/90 tabular-nums"
                      : "text-right text-ink/90 tabular-nums"
                  }
                >
                  {valueKey ? t(valueKey) : entry.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

type PlacePageProps = {
  place: LocationFull;
  hasEnglishVersion: boolean;
} & SSRConfig;

const PlacePage: NextPage<PlacePageProps> = ({ place }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";

  const name = getLocalized(place, locale, "name") || place.name;
  const title =
    getLocalized(place, locale, "meta_title") || `${name} — Barbizon`;
  const metaDescription =
    getLocalized(place, locale, "meta_description") ||
    getLocalized(place, locale, "short_description") ||
    place.short_description ||
    "";
  const ogImage = place.heroImage ?? undefined;
  return (
    <>
      <SeoHead
        title={title}
        description={metaDescription}
        path={`/places/${place.slug}`}
        locale={locale}
        image={ogImage}
        type="article"
        jsonLd={buildPlaceSchema(place, locale)}
        hasEnglishVersion={hasPublishedTranslation(place, "en")}
      />
      <UnifiedPlaceArticle place={place} locale={locale} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getPublishedLocationSlugs();
  const paths = slugs.map((slug) => ({ params: { slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<PlacePageProps> = async ({
  params,
  locale,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const placeRecord = await getLocationFull(slug);
  if (!placeRecord) {
    return { notFound: true };
  }

  const translations = await serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig);

  return {
    props: {
      place: placeRecord,
      hasEnglishVersion: hasPublishedTranslation(placeRecord, "en"),
      ...translations,
    },
    revalidate: 60,
  };
};

export default PlacePage;

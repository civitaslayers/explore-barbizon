import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { SeoHead } from "@/components/SeoHead";
import { getLocationCards, getPublishedTours } from "@/lib/supabase";
import type { TourListItem } from "@/lib/types";
import nextI18NextConfig from "@/next-i18next.config";

// Explicit editorial order, not alphabetical-first-three (brain/decisions.md
// task 1b180958). Verified live and published; none in the Practical layer.
const EXAMPLE_PLACE_SLUGS = ["maison-millet", "auberge-ganne", "point-de-vue-apremont"] as const;

type ExamplePlace = { slug: string; name: string };

type PlanPageProps = {
  examplePlaces: ExamplePlace[];
  tours: TourListItem[];
} & SSRConfig;

// Mid-sentence inline link with no <Trans> helper in this codebase: split the
// translated string on a sentinel inserted in place of {{mapLink}}, render
// the link between the two halves.
const MAP_LINK_SENTINEL = "@@MAPLINK@@";

const PlanYourVisitPage: NextPage<PlanPageProps> = ({ examplePlaces, tours }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("pages");

  const [step1Before, step1After] = t("plan.step1.body", {
    mapLink: MAP_LINK_SENTINEL,
  }).split(MAP_LINK_SENTINEL);

  return (
    <>
      <SeoHead
        title={t("plan.meta.title")}
        description={t("plan.meta.description")}
        path="/plan-your-visit"
        locale={locale}
      />

      <section className="space-y-10">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            {t("plan.eyebrow")}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {t("plan.title")}
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            {t("plan.intro")}
          </p>
        </header>

        <section className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              {t("plan.step1.title")}
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              {step1Before}
              <Link
                href="/map"
                className="underline-offset-4 hover:underline"
              >
                {t("plan.step1.mapLink")}
              </Link>
              {step1After}
            </p>
          </div>

          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              {t("plan.step2.title")}
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              {t("plan.step2.body")}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink/80">
              {examplePlaces.map((place) => (
                <li key={place.slug}>
                  <Link
                    href={`/places/${place.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {place.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              {t("plan.step3.title")}
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              {t("plan.step3.body")}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink/80">
              {tours.map((tour) => (
                <li key={tour.slug}>
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {tour.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlanPageProps> = async ({
  locale,
}) => {
  const [toursData, places, translations] = await Promise.all([
    getPublishedTours(),
    getLocationCards(),
    serverSideTranslations(locale ?? "fr", ["common", "pages"], nextI18NextConfig),
  ]);
  const tours = toursData.map((t) => ({
    slug: t.slug,
    title: t.name,
    summary: t.description ?? "",
    durationHours: Math.round((t.duration_minutes ?? 120) / 60),
    stops: t.stops.map((s) => s.location_id),
  }));

  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const examplePlaces: ExamplePlace[] = [];
  for (const slug of EXAMPLE_PLACE_SLUGS) {
    const place = bySlug.get(slug);
    if (place) {
      examplePlaces.push({ slug: place.slug, name: place.name });
    } else {
      console.warn(`[plan-your-visit] example place slug not found: ${slug}`);
    }
  }

  return { props: { examplePlaces, tours, ...translations }, revalidate: 60 };
};

export default PlanYourVisitPage;


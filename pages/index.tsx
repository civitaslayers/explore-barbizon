import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { SeoHead } from "@/components/SeoHead";
import { categoryLabel } from "@/lib/categoryLabel";
import { withRetry } from "@/lib/fetchPolicy";
import { heroImage800w } from "@/lib/media";
import { buildFeaturedPlaces, type FeaturedPlaceCard } from "@/lib/featuredPlaces";
import { getLocationCards } from "@/lib/supabase";
import nextI18NextConfig from "@/next-i18next.config";

type HomePageProps = {
  featuredPlaces: FeaturedPlaceCard[];
} & SSRConfig;

const HomePage: NextPage<HomePageProps> = ({ featuredPlaces }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("pages");
  const { t: tCommon } = useTranslation("common");
  // Per-locale manual line breaks for the hero headline (brain/decisions.md
  // gate-feedback round, task 1b180958) — an array, not `<br/>`s inside the
  // string, so each locale controls its own break points. `returnObjects`
  // is required: i18next defaults to treating a key resolving to a
  // non-string value as missing.
  const heroTitleLines = t("home.hero.titleLines", {
    returnObjects: true,
  }) as string[];
  return (
    <>
      <SeoHead
        title={t("home.meta.title")}
        description={t("home.meta.description")}
        path="/"
        locale={locale}
      />

      <div className="section-stack">
        {/* 1. HERO SECTION */}
        <section className="relative -mx-4 -mt-12 flex min-h-screen flex-col justify-end overflow-hidden bg-ink md:-mx-8 md:-mt-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/places/place-default.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          >
            <source src="/videos/hero-barbizon.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />

          <div className="fade-in-hero relative z-10 max-w-3xl space-y-6 p-8 md:p-14 lg:p-20">
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-cream/60">
              {t("home.hero.eyebrow")}
            </p>

            <h1 className="font-serif text-[3.2rem] italic leading-[0.95] tracking-tight text-cream md:text-[5rem] lg:text-[6rem]">
              {heroTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/map" className="btn btn-primary text-[10px]">
                {t("home.hero.ctaMap")}
              </Link>
              <Link
                href="/places"
                className="btn btn-secondary border-cream/40 text-[10px] text-cream hover:border-cream/70 hover:bg-cream/10"
              >
                {t("home.hero.ctaPlaces")}
              </Link>
            </div>
          </div>
        </section>

        {/* 2. WHY BARBIZON */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
          <div className="space-y-3">
            <p className="eyebrow">
              {t("home.why.eyebrow")}
            </p>
            <h2 className="heading-xl">
              {t("home.why.title")}
            </h2>
          </div>
          <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
            <p>{t("home.why.p1")}</p>
            <p>{t("home.why.p2")}</p>
          </div>
        </section>

        {/* 3. EXPLORE THE VILLAGE */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              {t("home.paths.eyebrow")}
            </p>
            <h2 className="heading-lg">
              {t("home.paths.title")}
            </h2>
          </header>
          <div className="grid gap-5 md:grid-cols-3 md:gap-7">
            <Link
              href="/map"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <span className="chip mb-3 inline-block">
                  {t("home.paths.map.eyebrow")}
                </span>
                <h3 className="font-serif text-base text-ink md:text-lg">
                  {t("home.paths.map.title")}
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  {t("home.paths.map.body")}
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/60">
                {t("home.paths.map.cta")}
              </span>
            </Link>

            <Link
              href="/plan-your-visit"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <span className="chip mb-3 inline-block">
                  {t("home.paths.trail.eyebrow")}
                </span>
                <h3 className="font-serif text-base text-ink md:text-lg">
                  {t("home.paths.trail.title")}
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  {t("home.paths.trail.body")}
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/60">
                {t("home.paths.trail.cta")}
              </span>
            </Link>

            <Link
              href="/stories"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <span className="chip mb-3 inline-block">
                  {t("home.paths.stories.eyebrow")}
                </span>
                <h3 className="font-serif text-base text-ink md:text-lg">
                  {t("home.paths.stories.title")}
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  {t("home.paths.stories.body")}
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/60">
                {t("home.paths.stories.cta")}
              </span>
            </Link>
          </div>
        </section>

        {/* 4. FEATURED PLACES */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              {t("home.featured.eyebrow")}
            </p>
            <h2 className="heading-lg">
              {t("home.featured.title")}
            </h2>
          </header>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredPlaces.map((place) => (
              <Link
                key={place.slug}
                href={`/places/${place.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
              >
                {place.image ? (
                  <div
                    className="absolute inset-0 bg-ink/40 bg-cover bg-center transition-transform duration-700 ease-soft group-hover:scale-105"
                    style={{ backgroundImage: `url(${heroImage800w(place.image)})` }}
                  />
                ) : (
                  <ImagePlaceholder
                    name={place.name}
                    className="absolute inset-0 transition-transform duration-700 ease-soft group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-surface-variant/60 p-5 backdrop-blur-sm">
                  <p className="mb-1 font-sans text-[9px] uppercase tracking-[0.25em] text-cream/60">
                    {categoryLabel(place.categorySlug, place.category, tCommon)}
                  </p>
                  <h3 className="font-serif text-base italic leading-tight text-cream">
                    {place.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-cream/70">
                    {place.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. MAP PREVIEW */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              {t("home.mapPreview.eyebrow")}
            </p>
            <h2 className="heading-lg">
              {t("home.mapPreview.title")}
            </h2>
          </header>
          <Link href="/map" className="btn btn-secondary text-[11px]">
            {t("home.mapPreview.cta")}
          </Link>
        </section>

        {/* 6. BARBIZON THROUGH TIME */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">{t("home.history.eyebrow")}</p>
            <h2 className="heading-lg">{t("home.history.title")}</h2>
          </header>
          <Link
            href="/history"
            className="group card card-hover flex flex-col justify-between p-7 md:p-8 editorial-measure"
          >
            <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
              {t("home.history.body")}
            </p>
            <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/60">
              {t("home.history.cta")}
            </span>
          </Link>
        </section>

        {/* 7. VISITOR INFO */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              {t("home.visitor.eyebrow")}
            </p>
            <h2 className="heading-lg">
              {t("home.visitor.title")}
            </h2>
          </header>
          <div className="grid gap-6 text-sm text-ink/80 md:grid-cols-3">
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                {t("home.visitor.park.title")}
              </h3>
              <p className="leading-relaxed">
                {t("home.visitor.park.body")}
              </p>
            </div>
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                {t("home.visitor.start.title")}
              </h3>
              <p className="leading-relaxed">
                {t("home.visitor.start.body")}
              </p>
            </div>
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                {t("home.visitor.bestTime.title")}
              </h3>
              <p className="leading-relaxed">
                {t("home.visitor.bestTime.body")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async ({
  locale,
}) => {
  const places = await withRetry("index getLocationCards", () => getLocationCards());
  const translations = await serverSideTranslations(locale ?? "fr", ["common", "pages"], nextI18NextConfig);
  return {
    props: { featuredPlaces: buildFeaturedPlaces(places, locale ?? "fr"), ...translations },
    revalidate: 60,
  };
};

export default HomePage;


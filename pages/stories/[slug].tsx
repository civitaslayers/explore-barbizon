import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation, type SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { marked } from "marked";
import RelatedStories from "@/components/RelatedStories";
import { SeoHead } from "@/components/SeoHead";
import { RELATED_SLUGS } from "@/data/relatedStories";
import { getLocalized, type LocalizableRow } from "@/lib/getLocalized";
import { degrade, withRetry } from "@/lib/fetchPolicy";
import { heroImage800w } from "@/lib/media";
import {
  resolveRelated,
  type RelatedContent,
  type RelatedPlaceRow,
  type RelatedStoryRow,
} from "@/lib/relatedStories";
import { buildArticleSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import nextI18NextConfig from "@/next-i18next.config";

// theme/dek are nullable: no hardcoded English fallback at fetch time
// (mapRowToPageStory) — the page renders a translated fallback instead
// (story.dek ?? t("story.dekFallback")).
type StoryPageStory = {
  slug: string;
  title: string;
  theme: string | null;
  dek: string | null;
  body: string;
  author: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  cover_credit: string | null;
  cover_alt: string | null;
  translations?: LocalizableRow["translations"];
};

type StoryPageProps = {
  story: StoryPageStory;
  related: RelatedContent;
} & SSRConfig;

function excerptFromBody(body: string | null, maxLen = 220): string {
  if (!body?.trim()) return "";
  const plain = body.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trimEnd()}…`;
}

type StoryDbRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  author: string | null;
  theme: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  cover_credit: string | null;
  cover_alt: string | null;
  translations?: LocalizableRow["translations"];
};

function mapRowToPageStory(row: StoryDbRow): StoryPageStory {
  const dek = row.subtitle?.trim() || excerptFromBody(row.body) || null;
  const theme = row.theme?.trim() || row.author?.trim() || null;
  const body = row.body?.trim() ?? "";
  return {
    slug: row.slug,
    title: row.title,
    theme,
    dek,
    body,
    author: row.author,
    published_at: row.published_at,
    cover_image_url: row.cover_image_url,
    cover_credit: row.cover_credit,
    cover_alt: row.cover_alt,
    translations: row.translations,
  };
}

async function getPublishedStorySlugs(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("stories")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

async function getPublishedStoryBySlug(
  slug: string
): Promise<StoryPageStory | null> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("stories")
    .select(
      "slug, title, subtitle, body, author, theme, published_at, cover_image_url, cover_credit, cover_alt, translations"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToPageStory(data as unknown as StoryDbRow);
}

// Related-content rows for the sidebar. Bounded `.in()` queries on the
// editorial slug lists (data/relatedStories.ts); only published records,
// explicit column lists. Display values are resolved per locale in
// resolveRelated() so the page props carry cards, never raw translations.
async function getRelatedStoryRows(slugs: string[]): Promise<RelatedStoryRow[]> {
  if (!supabase) throw new Error("Supabase not configured");
  if (slugs.length === 0) return [];

  const { data, error } = await supabase
    .from("stories")
    .select("slug, title, theme, translations")
    .in("slug", slugs)
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RelatedStoryRow[];
}

async function getRelatedPlaceRows(slugs: string[]): Promise<RelatedPlaceRow[]> {
  if (!supabase) throw new Error("Supabase not configured");
  if (slugs.length === 0) return [];

  // No `!inner` on categories: a location with a null category still resolves.
  const { data, error } = await supabase
    .from("locations")
    .select("slug, name, translations, categories(name, slug)")
    .in("slug", slugs)
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RelatedPlaceRow[];
}

const StoryPage: NextPage<StoryPageProps> = ({ story, related }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t, i18n } = useTranslation("common");

  const title = getLocalized(story, locale, "title") || story.title;
  // "subtitle" is the real DB/translations column name (see mapRowToPageStory);
  // `dek` below is a derived display value (subtitle, or a French excerpt
  // fallback) computed at fetch time — falling back to it here keeps a
  // sensible French dek when no published English subtitle exists yet, and
  // to the translated catalogue fallback when there is no dek at all.
  const dek =
    getLocalized(story, locale, "subtitle") ||
    story.dek ||
    t("story.dekFallback");
  const themeKey = story.theme ? `story.themes.${story.theme}` : null;
  const theme =
    themeKey && i18n.exists(themeKey) ? t(themeKey) : t("story.themeFallback");
  const coverAlt = getLocalized(story, locale, "cover_alt");
  const coverCredit = getLocalized(story, locale, "cover_credit");
  const localizedBody = getLocalized(story, locale, "body") || story.body;
  const bodyHtml = localizedBody
    ? marked(localizedBody, { breaks: true, gfm: true })
    : "";

  return (
    <>
      <SeoHead
        title={`${title} — Stories — Visit Barbizon`}
        description={dek}
        path={`/stories/${story.slug}`}
        locale={locale}
        image={story.cover_image_url ?? undefined}
        type="article"
        jsonLd={buildArticleSchema(
          {
            slug: story.slug,
            title,
            description: dek,
            author: story.author,
            published_at: story.published_at,
            image: story.cover_image_url,
          },
          locale
        )}
      />

      <article className="editorial-measure space-y-8">
        <p className="text-xs text-ink/50">
          <Link href="/stories" className="hover:text-ink">
            ← {t("actions.backToStories")}
          </Link>
        </p>

        <header className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
            {theme}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-ink/80">{dek}</p>
        </header>

        {story.cover_image_url ? (
          <figure>
            <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-surface-container-low">
              <img
                src={story.cover_image_url}
                srcSet={`${heroImage800w(story.cover_image_url)} 800w, ${story.cover_image_url} 1600w`}
                sizes="(min-width: 768px) 672px, (min-width: 640px) 608px, calc(100vw - 2rem)"
                alt={coverAlt}
                className="h-full w-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            {coverCredit ? (
              <figcaption className="mt-3 font-sans text-[11px] leading-relaxed text-ink/50">
                {coverCredit}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        {localizedBody ? (
          <div
            className="prose-story"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
        <RelatedStories stories={related.stories} places={related.places} />
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await withRetry("stories/[slug] getPublishedStorySlugs", () =>
    getPublishedStorySlugs()
  );
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<StoryPageProps> = async ({
  params,
  locale
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const translations = await serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig);

  const story = await withRetry(`stories/[slug] getPublishedStoryBySlug:${slug}`, () =>
    getPublishedStoryBySlug(slug)
  );
  if (!story) return { notFound: true };

  const spec = RELATED_SLUGS[slug];
  const empty: RelatedContent = { stories: [], places: [] };
  // The story itself still renders if this fails; only the sidebar is empty.
  const related = spec
    ? await degrade(
        `stories/[slug] related:${slug}`,
        async () => {
          const [storyRows, placeRows] = await Promise.all([
            getRelatedStoryRows(spec.stories),
            getRelatedPlaceRows(spec.places),
          ]);
          return resolveRelated(slug, spec, storyRows, placeRows, locale ?? "fr");
        },
        empty
      )
    : empty;

  return { props: { story, related, ...translations }, revalidate: 60 };
};

export default StoryPage;

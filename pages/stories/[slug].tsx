import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import type { ComponentProps } from "react";
import { marked } from "marked";
import RelatedStories from "@/components/RelatedStories";
import { SeoHead } from "@/components/SeoHead";
import { getAllStories } from "@/data/stories";
import { getLocalized, type LocalizableRow } from "@/lib/getLocalized";
import { buildArticleSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import nextI18NextConfig from "@/next-i18next.config";

type StoryPageStory = {
  slug: string;
  title: string;
  theme: string;
  dek: string;
  body: string;
  author: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  translations?: LocalizableRow["translations"];
};

type StoryPageProps = {
  story: StoryPageStory;
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
  translations?: LocalizableRow["translations"];
};

function mapRowToPageStory(row: StoryDbRow): StoryPageStory {
  const dek =
    row.subtitle?.trim() ||
    excerptFromBody(row.body) ||
    "A short essay from the editorial notebook.";
  const theme = row.theme?.trim() || row.author?.trim() || "Editorial";
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
      "slug, title, subtitle, body, author, theme, published_at, cover_image_url, translations"
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

const RELATED: Record<string, ComponentProps<typeof RelatedStories>> = {
  "rooms-of-light": {
    stories: [
      {
        slug: "inn-paintings-dinner",
        title: "The Inn Where Paintings Paid for Dinner",
        theme: "Village life"
      }
    ],
    places: [
      { slug: "maison-millet", name: "Maison Millet", category: "Studio" },
      { slug: "grande-rue", name: "Grande Rue", category: "Walk" }
    ]
  },
  "paths-to-the-forest": {
    stories: [
      {
        slug: "inn-paintings-dinner",
        title: "The Inn Where Paintings Paid for Dinner",
        theme: "Village life"
      }
    ],
    places: [
      {
        slug: "forest-entrance",
        name: "Forest Entrance",
        category: "Landscape"
      },
      {
        slug: "sentier-des-peintres",
        name: "Sentier des Peintres",
        category: "Walk"
      }
    ]
  },
  "inn-paintings-dinner": {
    stories: [
      {
        slug: "rooms-of-light",
        title: "Rooms of Light in a Forest Village",
        theme: "Studio"
      },
      {
        slug: "paths-to-the-forest",
        title: "Paths to the Forest Edge",
        theme: "Landscape"
      }
    ],
    places: [
      { slug: "auberge-ganne", name: "Auberge Ganne", category: "Museum" },
      {
        slug: "musee-de-barbizon",
        name: "Musée de Barbizon",
        category: "Museum"
      }
    ]
  },
  "the-gleaners": {
    stories: [
      {
        slug: "rooms-of-light",
        title: "Rooms of Light in a Forest Village",
        theme: "Studio"
      },
      {
        slug: "paths-to-the-forest",
        title: "Paths to the Forest Edge",
        theme: "Landscape"
      }
    ],
    places: [
      { slug: "maison-millet", name: "Maison Millet", category: "Studio" },
      { slug: "grande-rue", name: "Grande Rue", category: "Walk" }
    ]
  },
  "how-the-forest-became-a-picture": {
    stories: [
      {
        slug: "paths-to-the-forest",
        title: "Paths to the Forest Edge",
        theme: "Landscape"
      },
      {
        slug: "the-gleaners",
        title: "The Gleaners and What They Were Looking At",
        theme: "Landscape"
      }
    ],
    places: [
      {
        slug: "forest-entrance",
        name: "Forest Entrance",
        category: "Landscape"
      },
      {
        slug: "sentier-des-peintres",
        name: "Sentier des Peintres",
        category: "Walk"
      }
    ]
  }
};

const StoryPage: NextPage<StoryPageProps> = ({ story }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const bodyHtml = story.body
    ? marked(story.body, { breaks: true, gfm: true })
    : "";
  const related = RELATED[story.slug];

  const title = getLocalized(story, locale, "title") || story.title;
  // "subtitle" is the real DB/translations column name (see mapRowToPageStory);
  // `dek` below is a derived display value (subtitle, or a French excerpt
  // fallback) computed at fetch time — falling back to it here keeps a
  // sensible French dek when no published English subtitle exists yet.
  const dek = getLocalized(story, locale, "subtitle") || story.dek;

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
            ← Stories
          </Link>
        </p>

        <header className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
            {story.theme}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-ink/80">{dek}</p>
        </header>

        {story.body ? (
          <div
            className="prose-story"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
        {related ? <RelatedStories {...related} /> : null}
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const slugs = await getPublishedStorySlugs();
    const paths = slugs.map((slug) => ({ params: { slug } }));
    return { paths, fallback: "blocking" };
  } catch {
    const paths = getAllStories().map((s) => ({ params: { slug: s.slug } }));
    return { paths, fallback: false };
  }
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

  try {
    const story = await getPublishedStoryBySlug(slug);
    if (!story) return { notFound: true };
    return { props: { story, ...translations }, revalidate: 60 };
  } catch {
    const s = getAllStories().find((x) => x.slug === slug);
    if (!s) return { notFound: true };
    const story: StoryPageStory = {
      slug: s.slug,
      title: s.title,
      theme: s.theme,
      dek: s.dek,
      body: "",
      author: null,
      published_at: null,
      cover_image_url: null,
    };
    return { props: { story, ...translations }, revalidate: 60 };
  }
};

export default StoryPage;

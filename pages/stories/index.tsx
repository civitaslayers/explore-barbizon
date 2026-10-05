import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation, type SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { SeoHead } from "@/components/SeoHead";
import { getAllStories, type Story } from "@/data/stories";
import { supabase } from "@/lib/supabase";
import nextI18NextConfig from "@/next-i18next.config";

// dek/theme are nullable here (unlike data/stories.ts's Story type, which
// always carries literal strings) — the Supabase-sourced rows below have no
// subtitle/theme fallback at fetch time, so the page renders a translated
// fallback instead of a hardcoded English string (dek ?? t("story.dekFallback")).
type StoriesRowStory = Omit<Story, "dek" | "theme"> & {
  dek: string | null;
  theme: string | null;
};

type StoriesIndexProps = {
  stories: StoriesRowStory[];
} & SSRConfig;

function excerptFromBody(body: string | null, maxLen = 220): string {
  if (!body?.trim()) return "";
  const plain = body.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trimEnd()}…`;
}

function rowToStory(row: {
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  author: string | null;
  theme: string | null;
  type: string | null;
}): StoriesRowStory {
  const dek = row.subtitle?.trim() || excerptFromBody(row.body) || null;
  const theme = row.theme?.trim() || row.author?.trim() || null;
  const type = row.type === "guide" ? "guide" : "history";
  return { slug: row.slug, title: row.title, dek, theme, type };
}

async function getPublishedStoriesFromSupabase(): Promise<StoriesRowStory[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("stories")
    .select("slug, title, subtitle, body, author, theme, type")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("No published stories");

  return (
    data as unknown as Array<{
      slug: string;
      title: string;
      subtitle: string | null;
      body: string | null;
      author: string | null;
      theme: string | null;
      type: string | null;
    }>
  ).map(rowToStory);
}

const StoriesIndexPage: NextPage<StoriesIndexProps> = ({ stories }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("common");
  const { t: tPages } = useTranslation("pages");
  const essays = stories.filter((s) => (s.type ?? "history") === "history");
  const guides = stories.filter((s) => s.type === "guide");

  return (
    <>
      <SeoHead
        title={tPages("stories.meta.title")}
        description={tPages("stories.meta.description")}
        path="/stories"
        locale={locale}
      />

      <section className="space-y-10">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            {tPages("stories.eyebrow")}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {tPages("stories.title")}
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            {tPages("stories.intro")}
          </p>
        </header>

        {essays.length > 0 && (
          <div className="space-y-4">
            <p className="editorial-measure text-[11px] uppercase tracking-[0.2em] text-ink/50">
              {t("story.essays")}
            </p>
            <div className="space-y-6 md:space-y-8">
              {essays.map((story) => (
                <Link
                  key={story.slug}
                  href={`/stories/${story.slug}`}
                  className="editorial-measure block border-l border-ink/15 pl-4 transition-colors hover:border-ink/40"
                >
                  <article>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                      {story.theme ?? t("story.themeFallback")}
                    </p>
                    <h2 className="mt-1 font-serif text-lg text-ink">
                      {story.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">
                      {story.dek ?? t("story.dekFallback")}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">
                      {t("actions.readEssay")} →
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {guides.length > 0 && (
          <div className="space-y-4">
            <p className="editorial-measure text-[11px] uppercase tracking-[0.2em] text-ink/50">
              {t("story.inTheVillage")}
            </p>
            <div className="editorial-measure space-y-3">
              {guides.map((story) => (
                <Link
                  key={story.slug}
                  href={`/stories/${story.slug}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-ink/12 px-4 py-3 transition-colors hover:border-ink/25 hover:bg-ink/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-base text-ink">
                      {story.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink/70">
                      {story.dek ?? t("story.dekFallback")}
                    </p>
                  </div>
                  <span
                    className="mt-0.5 flex-shrink-0 text-ink/35"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<StoriesIndexProps> = async ({
  locale,
}) => {
  const translations = await serverSideTranslations(locale ?? "fr", ["common", "pages"], nextI18NextConfig);
  try {
    const stories = await getPublishedStoriesFromSupabase();
    return { props: { stories, ...translations }, revalidate: 60 };
  } catch {
    return { props: { stories: getAllStories(), ...translations }, revalidate: 60 };
  }
};

export default StoriesIndexPage;

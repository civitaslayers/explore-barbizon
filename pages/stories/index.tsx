import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { getAllStories, type Story } from "@/data/stories";
import { supabase } from "@/lib/supabase";

type StoriesIndexProps = {
  stories: Story[];
};

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
}): Story {
  const dek =
    row.subtitle?.trim() ||
    excerptFromBody(row.body) ||
    "A short essay from the editorial notebook.";
  const theme = row.theme?.trim() || row.author?.trim() || "Editorial";
  return { slug: row.slug, title: row.title, dek, theme };
}

async function getPublishedStoriesFromSupabase(): Promise<Story[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("stories")
    .select("slug, title, subtitle, body, author, theme")
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
    }>
  ).map(rowToStory);
}

const StoriesIndexPage: NextPage<StoriesIndexProps> = ({ stories }) => {
  return (
    <>
      <Head>
        <title>Stories — Visit Barbizon</title>
      </Head>

      <section className="space-y-10">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            EDITORIAL NOTEBOOK
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            Short essays on light, rooms, and routes.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            Stories on how Barbizon has been looked at: through studio windows,
            along forest paths, and in the quiet of small museums.
          </p>
        </header>

        <div className="space-y-6 md:space-y-8">
          {stories.map((story) => (
            <Link
              key={story.slug}
              href={`/stories/${story.slug}`}
              className="editorial-measure block border-l border-ink/15 pl-4 transition-colors hover:border-ink/40"
            >
              <article>
                <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                  {story.theme}
                </p>
                <h2 className="mt-1 font-serif text-lg text-ink">
                  {story.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {story.dek}
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">
                  Read essay →
                </p>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<StoriesIndexProps> = async () => {
  try {
    const stories = await getPublishedStoriesFromSupabase();
    return { props: { stories }, revalidate: 60 };
  } catch {
    return { props: { stories: getAllStories() }, revalidate: 60 };
  }
};

export default StoriesIndexPage;


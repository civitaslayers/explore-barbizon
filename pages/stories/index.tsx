import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { getAllStories, type Story } from "@/data/stories";

type StoriesIndexProps = {
  stories: Story[];
};

const StoriesIndexPage: NextPage<StoriesIndexProps> = ({ stories }) => {
  return (
    <>
      <Head>
        <title>Stories — Explore Barbizon</title>
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
            <article
              key={story.slug}
              className="editorial-measure border-l border-ink/15 pl-4"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                {story.theme}
              </p>
              <h2 className="mt-1 font-serif text-lg text-ink">
                {story.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {story.dek}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<StoriesIndexProps> = async () => {
  const stories = getAllStories();
  return {
    props: {
      stories
    }
  };
};

export default StoriesIndexPage;


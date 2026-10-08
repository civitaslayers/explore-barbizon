import Link from "next/link";
import { useTranslation } from "next-i18next/pages";
import { categoryLabel } from "@/lib/categoryLabel";
import type { RelatedPlaceCard, RelatedStoryCard } from "@/lib/relatedStories";

export type RelatedStoriesProps = {
  stories?: RelatedStoryCard[];
  places?: RelatedPlaceCard[];
};

export default function RelatedStories({
  stories,
  places
}: RelatedStoriesProps) {
  const { t, i18n } = useTranslation("common");
  const hasStories = stories && stories.length > 0;
  const hasPlaces = places && places.length > 0;

  if (!hasStories && !hasPlaces) return null;

  return (
    <div>
      {hasStories ? (
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            {t("story.relatedEssays")}
          </p>
          <div className="space-y-4 md:space-y-5">
            {stories!.map((story) => {
              const themeKey = story.theme ? `story.themes.${story.theme}` : null;
              const themeLabel =
                themeKey && i18n.exists(themeKey) ? t(themeKey) : t("story.themeFallback");
              return (
                <Link
                  key={story.slug}
                  href={`/stories/${story.slug}`}
                  className="block border-l border-ink/15 pl-4 transition-colors hover:border-ink/40"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                    {themeLabel}
                  </p>
                  <h2 className="mt-1 font-serif text-base text-ink md:text-lg">
                    {story.title}
                  </h2>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {hasPlaces ? (
        <section
          className={
            hasStories
              ? "mt-10 border-t border-ink/10 pt-10 space-y-6"
              : "space-y-6"
          }
        >
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            {t("story.placesInEssay")}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {places!.map((place) => (
              <Link
                key={place.slug}
                href={`/places/${place.slug}`}
                className="border border-ink/10 p-4 transition-colors hover:border-ink/25"
              >
                <p className="font-serif text-ink">{place.name}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {categoryLabel(place.categorySlug, place.categoryName, t)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

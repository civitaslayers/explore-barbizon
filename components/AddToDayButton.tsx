import { useTranslation } from "next-i18next/pages";
import { MY_DAY_MAX_STOPS } from "@/lib/myDay";
import { useMyDay } from "@/lib/useMyDay";

type Props = {
  slug: string;
  name: string;
  variant: "pill" | "icon";
  className?: string;
};

export default function AddToDayButton({ slug, name, variant, className = "" }: Props) {
  const { t } = useTranslation("common");
  const { has, toggle, isFull } = useMyDay();
  const inDay = has(slug);
  const blocked = isFull && !inDay;

  const onClick = () => {
    if (!blocked) toggle(slug);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={blocked}
        aria-pressed={inDay}
        aria-label={
          inDay
            ? t("myDay.removeAria", { name })
            : blocked
              ? t("myDay.full", { max: MY_DAY_MAX_STOPS })
              : t("myDay.addAria", { name })
        }
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-cream/90 text-base leading-none text-ink shadow-sm backdrop-blur-sm transition-all duration-250 ease-soft hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        <span aria-hidden>{inDay ? "✓" : "+"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={blocked}
      aria-pressed={inDay}
      className={`btn bg-ink text-cream hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
    >
      {inDay
        ? t("myDay.added")
        : blocked
          ? t("myDay.full", { max: MY_DAY_MAX_STOPS })
          : t("myDay.add")}
    </button>
  );
}

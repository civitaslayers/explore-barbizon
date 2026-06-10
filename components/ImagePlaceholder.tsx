type ImagePlaceholderProps = {
  name: string;
  className?: string;
};

export default function ImagePlaceholder({
  name,
  className = "",
}: ImagePlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex items-center justify-center border border-ink/10 bg-cream ${className}`}
      aria-hidden
    >
      <span className="font-serif text-4xl text-ink/20 md:text-5xl lg:text-6xl">
        {initial}
      </span>
    </div>
  );
}

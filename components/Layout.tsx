import type { ReactNode } from "react";
import Link from "next/link";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
        <div className="container flex max-w-content items-center justify-between py-4 md:py-5">
          <Link
            href="/"
            className="font-serif text-xs uppercase tracking-[0.26em] text-ink md:text-sm"
          >
            Explore Barbizon
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/map" className="nav-link">
              Explore Map
            </Link>
            <Link href="/places" className="nav-link">
              Places
            </Link>
            <Link href="/stories" className="nav-link">
              Stories
            </Link>
            <Link href="/plan-your-visit" className="nav-link">
              Plan Your Visit
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="editorial-container py-12 md:py-20">{children}</div>
      </main>

      <footer className="border-t border-ink/10 bg-cream/95">
        <div className="container max-w-content flex flex-col gap-8 py-10 text-xs text-ink/70 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="font-serif text-sm text-ink">Explore Barbizon</div>
            <div className="text-[11px] uppercase tracking-[0.22em]">
              Powered by Civitas Layers
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <Link href="/about" className="footer-link">
              About
            </Link>
            <Link href="/map" className="footer-link">
              Map
            </Link>
            <Link href="/stories" className="footer-link">
              Stories
            </Link>
            <a
              href="mailto:info@explorebarbizon.com"
              className="footer-link"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import BottomNav from "@/components/BottomNav";

type LayoutProps = {
  children: ReactNode;
};

const navLinks = [
  { href: "/map", label: "Explore Map" },
  { href: "/places", label: "Places" },
  { href: "/stories", label: "Stories" },
  { href: "/plan-your-visit", label: "Plan Your Visit" },
];

export function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useRouter();

  const toggleMenu = () => setMenuOpen((v) => !v);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-cream">
        {/* Mobile: three-element bar */}
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-4 md:hidden">
          <button
            type="button"
            onClick={toggleMenu}
            className="p-1 text-ink/60 transition-colors duration-300 hover:text-ink"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="6" x2="18" y2="6" />
              <line x1="2" y1="10" x2="18" y2="10" />
              <line x1="2" y1="14" x2="18" y2="14" />
            </svg>
          </button>

          <Link
            href="/"
            className="font-serif text-lg italic tracking-tight text-ink no-underline transition-opacity duration-200 hover:opacity-75"
            onClick={() => setMenuOpen(false)}
          >
            Visit Barbizon
          </Link>

          <button
            type="button"
            className="p-1 text-ink/60 transition-colors duration-300 hover:text-ink"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-ink/10 bg-cream/95 px-6 py-5 md:hidden">
            <ul className="flex flex-col gap-5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-[11px] uppercase tracking-[0.3em] no-underline transition-colors duration-200 ${pathname === href ? "text-ink" : "text-ink/50 hover:text-ink"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Desktop: existing nav — hidden on mobile */}
        <div className="mx-auto hidden w-full max-w-screen-2xl items-center justify-between px-6 py-4 md:flex md:py-5">
          <Link
            href="/"
            className="select-none font-serif text-lg italic tracking-tight text-ink no-underline transition-opacity duration-200 hover:opacity-75"
            onClick={() => setMenuOpen(false)}
          >
            Visit Barbizon
          </Link>

          <nav className="flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="p-1 text-ink/60 transition-colors duration-300 hover:text-ink"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-px w-full bg-surface-container-low" />
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        {pathname === "/map" ? (
          <div className="px-4 pb-6 pt-4 md:px-8 md:pt-5">{children}</div>
        ) : (
          <div className="editorial-container py-12 md:py-20">{children}</div>
        )}
      </main>

      <BottomNav />

      <footer className="border-t border-ink/10 bg-cream/95">
        <div className="container max-w-content flex flex-col gap-8 py-10 text-xs text-ink/70 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="font-serif text-sm text-ink">Visit Barbizon</div>
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

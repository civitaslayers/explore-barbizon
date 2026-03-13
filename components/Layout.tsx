import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
        <div className="container flex max-w-content items-center justify-between py-4 md:py-5">
          <Link
            href="/"
            className="font-serif text-xs uppercase tracking-[0.26em] text-ink md:text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Explore Barbizon
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col items-end gap-[5px] p-1 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-px w-5 bg-ink transition-all duration-200 ease-soft ${menuOpen ? "translate-y-[7px] -rotate-45" : ""}`}
            />
            <span
              className={`block h-px bg-ink transition-all duration-200 ease-soft ${menuOpen ? "w-5 opacity-0" : "w-3.5"}`}
            />
            <span
              className={`block h-px w-5 bg-ink transition-all duration-200 ease-soft ${menuOpen ? "-translate-y-[7px] rotate-45" : ""}`}
            />
          </button>
        </div>

        {/* Mobile nav panel */}
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


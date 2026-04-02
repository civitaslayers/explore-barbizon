import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const NAV: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/locations", label: "Locations" },
  { href: "/dashboard/places", label: "Places" },
  { href: "/dashboard/stories", label: "Stories" },
  { href: "/dashboard/tours", label: "Tours" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = router.pathname;

  return (
    <div className="min-h-screen bg-cream text-ink font-sans flex">
      <aside className="w-52 shrink-0 bg-surface-container-low flex flex-col py-6 px-4 border-r border-outline-variant">
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/dashboard"
                ? path === "/dashboard"
                : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded px-3 py-2 text-sm ${
                  active
                    ? "bg-surface font-medium text-ink"
                    : "text-on-surface-variant hover:bg-surface-container-lowest"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 px-6 flex items-center justify-between bg-surface-container-low border-b border-outline-variant">
          <span className="font-serif italic text-lg tracking-tight text-ink">
            Dashboard
          </span>
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-ink transition-colors transition-duration-250 transition-timing-soft"
          >
            ← Visit site
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

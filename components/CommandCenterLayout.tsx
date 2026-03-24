import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", href: "/command-center" },
  { label: "Tasks", href: "/command-center/tasks" },
  { label: "Decisions", href: "/command-center/decisions" },
  { label: "Memory", href: "/command-center/memory" },
  { label: "Prompts", href: "/command-center/prompts" },
];

export function CommandCenterLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream text-ink flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-ink/10 flex flex-col">
        <div className="px-5 py-5 border-b border-ink/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-ink/35 mb-1.5">
            Civitas Layers
          </p>
          <p className="font-serif text-[1.05rem] leading-tight tracking-tight">
            Command Center
          </p>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(({ label, href }) => {
            const active =
              router.pathname === href ||
              (href !== "/command-center" &&
                router.pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded text-[11px] uppercase tracking-[0.18em] no-underline transition-colors duration-200 ${
                  active
                    ? "bg-ink text-cream"
                    : "text-ink/45 hover:text-ink hover:bg-ink/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-ink/10">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.18em] text-ink/30 no-underline hover:text-ink/50 transition-colors duration-200"
          >
            ← Public site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { useRouter } from "next/router";

const tabs = [
  {
    label: "Atlas",
    href: "/map",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round">
        <polygon points="1,4 8,1 14,5 21,2 21,18 14,21 8,17 1,20" />
        <line x1="8" y1="1" x2="8" y2="17" />
        <line x1="14" y1="5" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    label: "Trails",
    href: "/map", // trails are shown on map; no /tours index exists
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <line x1="11" y1="2" x2="11" y2="5" />
        <line x1="11" y1="17" x2="11" y2="20" />
        <line x1="2" y1="11" x2="5" y2="11" />
        <line x1="17" y1="11" x2="20" y2="11" />
        <circle cx="11" cy="11" r="2.5" fill="currentColor"
          stroke="none" />
      </svg>
    ),
  },
  {
    label: "Stories",
    href: "/stories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M4 2h14a1 1 0 0 1 1 1v16l-4-2-4 2-4-2-4 2V3a1 1 0 0 1 1-1z" />
        <line x1="8" y1="8" x2="14" y2="8" />
        <line x1="8" y1="12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Places",
    href: "/places",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M11 2C7.686 2 5 4.686 5 8c0 5 6 12 6 12s6-7 6-12c0-3.314-2.686-6-6-6z" />
        <circle cx="11" cy="8" r="2" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const router = useRouter();
  if (router.pathname.startsWith("/dashboard")) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-cream/90 backdrop-blur-md rounded-t-2xl shadow-[0_-4px_40px_rgba(121,91,61,0.04)] md:hidden">
      <div className="flex justify-around items-center px-4 pb-6 pt-2">
        {tabs.map((tab) => {
          const isActive = router.pathname === tab.href ||
            (tab.href !== "/" && router.pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-1 pt-2 transition-all duration-300 ${isActive
                ? "text-ink border-t-2 border-ink -translate-y-0.5"
                : "text-ink/35 border-t-2 border-transparent"
                }`}
            >
              {tab.icon}
              <span className="font-sans text-[9px] tracking-widest uppercase">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

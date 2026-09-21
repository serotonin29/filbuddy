"use client";

// ============================================================
// Bottom navigation mobile-first: Home · Explore · Community · Messages · Profile
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home", icon: "home", exact: true },
  { href: "/dashboard/katalog", label: "Explore", icon: "explore" },
  { href: "/dashboard/community", label: "Community", icon: "diversity_3" },
  { href: "/dashboard/messages", label: "Messages", icon: "chat_bubble" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
];

export function BottomNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="Navigasi utama"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(it.href, it.exact);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="relative">
                <span className="material-symbols-outlined text-[22px]">{it.icon}</span>
                {it.href === "/dashboard/messages" && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </span>
              {it.label}
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-600" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

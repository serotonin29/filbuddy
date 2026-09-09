"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Brand } from "@/components/Brand";

const navTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/katalog", label: "Katalog Skill" },
  { href: "/dashboard/forum", label: "Forum Tanya Jawab" },
  { href: "/dashboard/slot", label: "Slot Barter Saya" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
];

export function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, logout, activities, degraded } = useStore();
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<"notif" | "profile" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  const unreadNotifs = activities.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center group shrink-0">
              <Brand className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform" />
            </Link>

            <form
              className="hidden md:flex flex-1 max-w-md mx-4"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/dashboard/forum?q=${encodeURIComponent(query)}`);
              }}
            >
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari skill, mentor, atau mata kuliah..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-code text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
                  ⌘K
                </span>
              </div>
            </form>

            <div className="flex items-center gap-2.5 shrink-0" ref={menuRef}>
              {degraded && (
                <span
                  title="Supabase terkonfigurasi tapi tabel belum ada — jalankan supabase/schema.sql di SQL Editor Supabase."
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-code font-bold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <span className="material-symbols-outlined text-[13px]">cloud_off</span>
                  MODE DEMO — DB BELUM TERSAMBUNG
                </span>
              )}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-label-code text-xs font-bold">
                <span>⚡ {user.points} Pts</span>
                <button
                  type="button"
                  aria-label="Cara dapat poin"
                  onClick={() => router.push("/dashboard/forum")}
                  className="text-amber-500 hover:text-amber-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">help</span>
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifikasi"
                  onClick={() => setOpenMenu((m) => (m === "notif" ? null : "notif"))}
                  className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>
                {openMenu === "notif" && (
                  <div className="absolute right-0 top-11 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-[fade-up_0.25s_ease-out_both]">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide px-2 pb-2">Notifikasi</p>
                    {unreadNotifs.map((a) => (
                      <div key={a.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${a.iconClass}`}>
                          <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-800 leading-snug">
                            <strong className="font-semibold">{a.title}</strong> {a.desc}
                          </p>
                          <span className="text-[10px] text-slate-400">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((m) => (m === "profile" ? null : "profile"))}
                  className="flex items-center gap-2.5 pl-1 sm:pl-2 sm:border-l border-slate-200 py-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-headline-sm text-sm font-bold">
                    {initialsOf(user.name)}
                  </div>
                  <div className="hidden lg:flex flex-col leading-tight text-left">
                    <span className="font-headline-sm text-sm font-bold text-slate-900 flex items-center gap-1">
                      {user.name.split(" ")[0]} {user.name.split(" ")[1] ?? ""}
                      <span className="material-symbols-outlined text-[14px] text-emerald-500">verified_user</span>
                    </span>
                    <span className="font-label-code text-[10px] text-slate-400">
                      {user.nim} · {user.prodi} &apos;22
                    </span>
                  </div>
                </button>
                {openMenu === "profile" && (
                  <div className="absolute right-0 top-12 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-[fade-up_0.25s_ease-out_both]">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="font-label-code text-[10px] text-slate-400">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-label-code font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        ⚡ {user.points} Pts
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">space_dashboard</span>
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/slot"
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">event_available</span>
                      Slot Barter Saya
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-rose-400">logout</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
            {navTabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3.5 py-2.5 font-label-ui text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FilBuddy © 2025</span>
            <span>•</span>
            <span>Universitas Putra Indonesia YPTK Padang</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-indigo-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Ketentuan Layanan</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Pusat Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

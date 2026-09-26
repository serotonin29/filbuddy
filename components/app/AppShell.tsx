"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CommunityProvider } from "@/lib/communityStore";
import { LearnProvider } from "@/lib/learnStore";
import { MessagesProvider, useMessages } from "@/lib/messagesStore";
import { BottomNav } from "@/components/app/BottomNav";
import { SearchCommand } from "@/components/app/SearchCommand";
import { Brand } from "@/components/Brand";
import type { Activity, User } from "@/lib/storeTypes";

const navTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/katalog", label: "Katalog Skill" },
  { href: "/dashboard/learn", label: "Kelas Belajar" },
  { href: "/dashboard/forum", label: "Forum Tanya Jawab" },
  { href: "/dashboard/community", label: "Community" },
  { href: "/dashboard/messages", label: "Pesan" },
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

const LS_NOTIF_READ = "filbuddy-notif-read";

function activityHref(a: Activity): string {
  const t = `${a.title} ${a.desc}`.toLowerCase();
  if (t.includes("forum") || t.includes("pertanyaan") || t.includes("jawaban") || t.includes("terbaik")) return "/dashboard/forum";
  if (t.includes("slot") || t.includes("barter")) return "/dashboard/slot";
  if (t.includes("room")) return "/dashboard/community/skill-rooms";
  if (t.includes("event") || t.includes("kopdar")) return "/dashboard/community/events";
  return "/dashboard";
}

function AppShellInner({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, activities, degraded } = useStore();
  const { totalUnread: unreadMessages } = useMessages();
  const [openMenu, setOpenMenu] = useState<"notif" | "profile" | null>(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem(LS_NOTIF_READ) ?? "[]") as number[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persistRead = (ids: number[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem(LS_NOTIF_READ, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notifList = useMemo(() => activities.slice(0, 8), [activities]);
  const unreadNotifs = useMemo(() => notifList.filter((a) => !readIds.includes(a.id)), [notifList, readIds]);

  const openNotif = (a: Activity) => {
    persistRead([...readIds, a.id]);
    setOpenMenu(null);
    router.push(activityHref(a));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center group shrink-0">
              <Brand className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform" />
            </Link>

            {mobileSearch ? (
              <SearchCommand mode="mobile" onCloseMobile={() => setMobileSearch(false)} />
            ) : (
              <>
                <SearchCommand mode="desktop" onCloseMobile={() => undefined} />

                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0" ref={menuRef}>
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

                  {/* Pencarian (mobile) */}
                  <button
                    type="button"
                    aria-label="Buka pencarian"
                    onClick={() => setMobileSearch(true)}
                    className="md:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>

                  {/* Pesan (mobile shortcut) */}
                  <Link
                    href="/dashboard/messages"
                    aria-label={`Pesan${unreadMessages > 0 ? ` — ${unreadMessages} belum dibaca` : ""}`}
                    className="md:hidden relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Notifikasi${unreadNotifs.length > 0 ? ` — ${unreadNotifs.length} belum dibaca` : ""}`}
                      aria-expanded={openMenu === "notif"}
                      onClick={() => setOpenMenu((m) => (m === "notif" ? null : "notif"))}
                      className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">notifications</span>
                      {unreadNotifs.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {unreadNotifs.length}
                        </span>
                      )}
                    </button>
                    {openMenu === "notif" && (
                      <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-[fade-up_0.25s_ease-out_both]">
                        <div className="flex items-center justify-between px-2 pb-2">
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Notifikasi</p>
                          {unreadNotifs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => persistRead(notifList.map((a) => a.id))}
                              className="text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              Tandai semua dibaca
                            </button>
                          )}
                        </div>
                        {notifList.length === 0 && <p className="px-2 py-4 text-xs text-slate-500 text-center">Belum ada aktivitas.</p>}
                        {notifList.map((a) => {
                          const isUnread = !readIds.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => openNotif(a)}
                              className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                                isUnread ? "bg-indigo-50/60 hover:bg-indigo-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${a.iconClass}`}>
                                <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-800 leading-snug">
                                  <strong className="font-semibold">{a.title}</strong> {a.desc}
                                </p>
                                <span className="text-[10px] text-slate-400">{a.time}</span>
                              </div>
                              {isUnread && <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" aria-hidden />}
                            </button>
                          );
                        })}
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
                          href="/dashboard/profile"
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                          Profil Saya
                        </Link>
                        <Link
                          href="/dashboard/messages"
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className="material-symbols-outlined text-[18px] text-slate-400">chat_bubble</span>
                          Pesan
                          {unreadMessages > 0 && <span className="ml-auto text-[10px] font-bold text-rose-600">{unreadMessages} baru</span>}
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
              </>
            )}
          </div>

          {/* Sub-nav tabs — desktop saja; mobile memakai BottomNav */}
          <nav aria-label="Navigasi bagian" className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
            {navTabs.map((tab) => {
              const active =
                tab.href === "/dashboard"
                  ? pathname === tab.href
                  : pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3.5 py-2.5 font-label-ui text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                  {tab.href === "/dashboard/messages" && unreadMessages > 0 && (
                    <span className="absolute top-2 right-1 w-2 h-2 rounded-full bg-rose-500" aria-hidden />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        <CommunityProvider>
          <LearnProvider>{children}</LearnProvider>
        </CommunityProvider>
      </main>

      <BottomNav unreadMessages={unreadMessages} />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FilBuddy © 2025</span>
            <span>•</span>
            <span>Universitas Putra Indonesia YPTK Padang</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privasi" className="hover:text-indigo-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/pedoman" className="hover:text-indigo-600 transition-colors">Pedoman Komunitas</Link>
            <Link href="/bantuan" className="hover:text-indigo-600 transition-colors">Pusat Bantuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, user } = useStore();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <MessagesProvider myName={user.name}>
      <AppShellInner user={user}>{children}</AppShellInner>
    </MessagesProvider>
  );
}

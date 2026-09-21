"use client";

// ============================================================
// Katalog Skill — jelajahi skill yang bisa ditukar antar buddy
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";
import { SEED_BUDDIES, avatarColor, initialsOf2, type Buddy } from "@/lib/communityData";

type CatalogEntry = {
  key: string;
  skill: string;
  buddy: Buddy;
  level: "Pemula" | "Menengah" | "Mahir";
  category: string;
};

const CATEGORY_FILTERS = [
  "Semua",
  "Web Dev",
  "Mobile",
  "UI/UX",
  "Database",
  "Jaringan",
  "Algoritma",
  "Lainnya",
];

const LEVEL_FILTERS = ["Semua", "Pemula", "Menengah", "Mahir"] as const;

const CATEGORY_RULES: [RegExp, string][] = [
  [/react|next|javascript|typescript|css|html|tailwind|laravel|node|php|vue/i, "Web Dev"],
  [/flutter|kotlin|swift|mobile|android|ios/i, "Mobile"],
  [/figma|ui|ux|desain|design|poster|ilustrasi/i, "UI/UX"],
  [/sql|mysql|postgres|mongo|database|basis data|prisma|supabase/i, "Database"],
  [/mikrotik|jaringan|network|cisco|iot|raspi|raspberry/i, "Jaringan"],
  [/algoritma|struktur data|python|java|c\+\+|competitive|pemrograman/i, "Algoritma"],
];

function categorize(skill: string): string {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(skill)) return cat;
  }
  return "Lainnya";
}

const LEVEL_META: Record<CatalogEntry["level"], { chip: string }> = {
  Pemula: { chip: "bg-sky-50 text-sky-700 border-sky-200" },
  Menengah: { chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  Mahir: { chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function KatalogPage() {
  const { user, requestBarter } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [level, setLevel] = useState<(typeof LEVEL_FILTERS)[number]>("Semua");
  const [barterTarget, setBarterTarget] = useState<CatalogEntry | null>(null);
  const [barterDone, setBarterDone] = useState<string | null>(null);

  const catalog = useMemo<CatalogEntry[]>(() => {
    const entries: CatalogEntry[] = [];
    for (const buddy of SEED_BUDDIES) {
      buddy.knows.forEach((skill, i) => {
        entries.push({
          key: `${buddy.id}-${i}`,
          skill,
          buddy,
          level: i === 0 ? "Mahir" : i <= 2 ? "Menengah" : "Pemula",
          category: categorize(skill),
        });
      });
    }
    return entries;
  }, []);

  const mySkills = user?.teachSkills.map((s) => s.name.toLowerCase()) ?? [];
  const myLearning = user?.learnSkills.map((s) => s.name.toLowerCase()) ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((e) => {
        const matchCat = category === "Semua" || e.category === category;
        const matchLevel = level === "Semua" || e.level === level;
        const matchQ =
          !q || e.skill.toLowerCase().includes(q) || e.buddy.name.toLowerCase().includes(q) || e.buddy.learning.some((l) => l.toLowerCase().includes(q));
        return matchCat && matchLevel && matchQ;
      })
      .sort((a, b) => b.buddy.stats.helped - a.buddy.stats.helped);
  }, [catalog, query, category, level]);

  const isMatch = (e: CatalogEntry) =>
    myLearning.some((l) => e.skill.toLowerCase().includes(l) || l.includes(e.skill.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <Reveal>
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Katalog Skill</h1>
          <p className="mt-1.5 font-body-md text-sm text-slate-600">
            Jelajahi skill yang bisa ditukar dari mahasiswa se-Filkom — cari yang cocok, lalu minta barter.
          </p>
        </div>
      </Reveal>

      {/* Statistik */}
      <Reveal>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Skill ditawarkan", value: catalog.length, icon: "sell", accent: "text-indigo-600 bg-indigo-50 border-indigo-200" },
            { label: "Buddy terdaftar", value: SEED_BUDDIES.length, icon: "group", accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "Skill kamu", value: user?.teachSkills.length ?? 0, icon: "star", accent: "text-amber-600 bg-amber-50 border-amber-200" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-2 ${s.accent}`}>
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              </div>
              <p className="font-headline-lg text-lg font-extrabold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Pencarian & filter */}
      <Reveal>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari skill atau buddy... (cth. React, Figma, Mikrotik)"
              aria-label="Cari skill di katalog"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === c ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="w-px h-6 bg-slate-200 mx-1 shrink-0" aria-hidden />
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  level === l ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {l === "Semua" ? "Semua level" : l}
              </button>
            ))}
          </div>
          <p className="font-label-code text-[10px] text-slate-400">{filtered.length} skill tampil</p>
        </div>
      </Reveal>

      {/* Grid katalog */}
      <Reveal>
        {filtered.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
            <p className="text-sm text-slate-500 mt-2">
              Tidak ada skill yang cocok dengan filter ini. Coba kata kunci lain, atau{" "}
              <Link href="/dashboard/community/buddy" className="font-bold text-indigo-600 hover:underline">
                cari buddy
              </Link>{" "}
              yang bisa diajari.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const match = isMatch(e);
              const offeredByMe = mySkills.includes(e.skill.toLowerCase());
              return (
                <article key={e.key} className="flex flex-col h-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-600 border-slate-200">
                      {e.category}
                    </span>
                    {match && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        Cocok buat kamu
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2.5 font-headline-sm text-base font-bold text-slate-900 leading-snug">{e.skill}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(e.buddy.name)}`}
                    >
                      {initialsOf2(e.buddy.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{e.buddy.name}</p>
                      <p className="font-label-code text-[10px] text-slate-400">
                        {e.buddy.prodi} · Sem {e.buddy.semester} · membantu {e.buddy.stats.helped}×
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LEVEL_META[e.level].chip}`}>{e.level}</span>
                    {e.buddy.circles.slice(0, 1).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500">
                        aktif di {c === "web-dev" ? "Web Dev" : c === "uiux" ? "UI/UX" : c === "aiml" ? "AI/ML" : "circle"}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBarterTarget(e);
                        setBarterDone(null);
                      }}
                      disabled={offeredByMe}
                      className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20 transition-colors"
                    >
                      {offeredByMe ? "Skill kamu sendiri" : "Minta Barter"}
                    </button>
                    <Link
                      href={`/dashboard/community/buddy?focus=${e.buddy.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      Profil
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Reveal>

      {/* Skill yang kamu tawarkan */}
      <Reveal>
        <section className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <h2 className="font-headline-sm text-base font-bold text-slate-900">Skill yang kamu tawarkan</h2>
          {user && user.teachSkills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.teachSkills.map((s) => (
                <span key={s.name} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                  {s.name} · {s.level}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Kamu belum mendaftarkan skill. Skill-mu akan tampil di katalog ini supaya buddy lain bisa menemukanmu.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/community/skill-rooms/new"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Ajarkan lewat Skill Room
            </Link>
            <Link
              href="/dashboard/forum"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Jawab pertanyaan di Forum
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Modal barter */}
      {barterTarget && (
        <BarterModal
          entry={barterTarget}
          onClose={() => setBarterTarget(null)}
          onSubmit={(teach, need) => {
            requestBarter(barterTarget.buddy.name, teach, need);
            setBarterDone(barterTarget.buddy.name);
            setBarterTarget(null);
          }}
        />
      )}
      {barterDone && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-2xl flex items-center gap-2 animate-[fade-up_0.25s_ease-out_both]">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          Permintaan barter terkirim ke {barterDone} — pantau di Slot Barter.
          <Link href="/dashboard/slot" className="ml-1 underline font-bold text-indigo-300 hover:text-indigo-200">
            Lihat
          </Link>
        </div>
      )}
    </div>
  );
}

function BarterModal({
  entry,
  onClose,
  onSubmit,
}: {
  entry: CatalogEntry;
  onClose: () => void;
  onSubmit: (teach: string, need: string) => void;
}) {
  const { user } = useStore();
  const [teach, setTeach] = useState(user?.teachSkills[0]?.name ?? "");
  const [need, setNeed] = useState(`Halo, saya ingin belajar ${entry.skill}`);

  const suggestions = user?.teachSkills.map((s) => s.name) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label="Minta barter">
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" />
      <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-base font-bold text-slate-900">Minta Barter</h2>
            <p className="text-[11px] text-slate-500">
              {entry.skill} — dengan {entry.buddy.name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!teach.trim() || !need.trim()) return;
            onSubmit(teach.trim(), need.trim());
          }}
        >
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Skill yang bisa kamu tawarkan</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTeach(s)}
                    aria-pressed={teach === s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      teach === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="barter-teach" className="text-xs font-bold text-slate-700">
              Kamu menawarkan
            </label>
            <input
              id="barter-teach"
              type="text"
              value={teach}
              onChange={(e) => setTeach(e.target.value)}
              placeholder="cth. Dasar CSS & Flexbox"
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="barter-need" className="text-xs font-bold text-slate-700">
              Pesan / kebutuhanmu
            </label>
            <textarea
              id="barter-need"
              rows={3}
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Permintaan masuk ke Slot Barter dengan status menunggu konfirmasi.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors">
              Kirim Permintaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

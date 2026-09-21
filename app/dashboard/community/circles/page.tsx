"use client";

// ============================================================
// Buddy Circles Discovery — cari circle sesuai minat
// ============================================================

import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { CIRCLE_CATEGORIES, type CircleCategory } from "@/lib/communityData";
import { CircleCard } from "@/components/community/cards";
import { CommunityHeader, CommunityNav, EmptyState } from "@/components/community/ui";

export default function CirclesPage() {
  const { circles, joinedCircles } = useCommunity();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CircleCategory | "semua">("semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return circles.filter((c) => {
      const matchCat = category === "semua" || c.category === category;
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [circles, query, category]);

  const joinedCount = circles.filter((c) => joinedCircles[c.id]).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4">
          <CommunityHeader subtitle="Temukan circle sesuai minatmu — belajar makin seru bareng orang yang se-minat." />
          <CommunityNav />
        </div>
      </Reveal>

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
              placeholder="Cari circle, topik, atau tag..."
              aria-label="Cari circle"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CIRCLE_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
            <span className="ml-auto shrink-0 pl-2 font-label-code text-[10px] text-slate-400 hidden sm:inline">
              {joinedCount} circle diikuti · {circles.length} total
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        {filtered.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="Tidak ada circle yang cocok"
            description="Coba kata kunci lain atau ganti kategori. Atau mulai dari kategori populer seperti Teknologi dan Akademik."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("semua");
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Reset filter
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...filtered]
              .sort((a, b) => (joinedCircles[b.id] ? 1 : 0) - (joinedCircles[a.id] ? 1 : 0))
              .map((c) => (
                <CircleCard key={c.id} circle={c} />
              ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}

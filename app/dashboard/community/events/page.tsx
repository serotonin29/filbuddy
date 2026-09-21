"use client";

// ============================================================
// FILKOM Events — agenda belajar & kegiatan antar-circle
// ============================================================

import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/communityData";
import { EventCard } from "@/components/community/cards";
import { CommunityHeader, CommunityNav, EmptyState } from "@/components/community/ui";

type TimeFilter = "semua" | "minggu" | "bulan";

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "semua", label: "Semua waktu" },
  { id: "minggu", label: "Minggu ini" },
  { id: "bulan", label: "Bulan ini" },
];

export default function EventsPage() {
  const { events, eventStatus } = useCommunity();
  const [time, setTime] = useState<TimeFilter>("semua");
  const [category, setCategory] = useState<EventCategory | "semua">("semua");

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        const matchTime = time === "semua" || (time === "minggu" ? e.inDays <= 7 : e.inDays <= 30);
        const matchCat = category === "semua" || e.category === category;
        return matchTime && matchCat;
      })
      .sort((a, b) => a.inDays - b.inDays);
  }, [events, time, category]);

  const myCount = events.filter((e) => eventStatus[e.id]).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4">
          <CommunityHeader subtitle="Workshop, kompetisi, dan meetup — ajak buddy biar makin semangat." />
          <CommunityNav />
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTime(f.id)}
                aria-pressed={time === f.id}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  time === f.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="w-px h-6 bg-slate-200 mx-1 shrink-0" aria-hidden />
            <button
              type="button"
              aria-pressed={category === "semua"}
              onClick={() => setCategory("semua")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === "semua" ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              Semua kategori
            </button>
            {EVENT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === c ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {myCount > 0 && (
            <p className="font-label-code text-[10px] text-slate-400">
              {myCount} event kamu tandai · {filtered.length} event tampil
            </p>
          )}
        </div>
      </Reveal>

      <Reveal>
        {filtered.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="Belum ada event dengan filter ini"
            description="Coba lebarkan rentang waktu atau ganti kategori. Panitia biasanya mengumumkan agenda baru tiap awal bulan."
            action={
              <button
                type="button"
                onClick={() => {
                  setTime("semua");
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
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}

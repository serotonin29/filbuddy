"use client";

// ============================================================
// Skill Rooms Discovery — belajar terstruktur bareng buddy
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { ROOM_TYPE_META, type RoomStatus, type RoomType } from "@/lib/communityData";
import { RoomCard } from "@/components/community/cards";
import { CommunityHeader, CommunityNav, EmptyState } from "@/components/community/ui";

const TYPE_FILTERS: { id: RoomType | "semua"; label: string }[] = [
  { id: "semua", label: "Semua tipe" },
  ...(Object.keys(ROOM_TYPE_META) as RoomType[]).map((t) => ({ id: t, label: ROOM_TYPE_META[t].label })),
];

const STATUS_FILTERS: { id: RoomStatus | "semua"; label: string }[] = [
  { id: "semua", label: "Semua status" },
  { id: "open", label: "🟢 Open" },
  { id: "almost", label: "🟡 Almost Full" },
  { id: "full", label: "🔴 Full" },
  { id: "finished", label: "⚪ Finished" },
];

export default function SkillRoomsPage() {
  const { rooms, joinedRooms } = useCommunity();
  const [type, setType] = useState<RoomType | "semua">("semua");
  const [status, setStatus] = useState<RoomStatus | "semua">("semua");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => {
      const st = r.finished
        ? "finished"
        : r.participantNames.length >= r.capacity
          ? "full"
          : r.participantNames.length >= r.capacity - 2
            ? "almost"
            : "open";
      const matchType = type === "semua" || r.type === type;
      const matchStatus = status === "semua" || st === status;
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.skill.toLowerCase().includes(q) || r.host.toLowerCase().includes(q);
      return matchType && matchStatus && matchQ;
    });
  }, [rooms, type, status, query]);

  const myRooms = rooms.filter((r) => joinedRooms[r.id]).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CommunityHeader subtitle="Belajar skill terstruktur dalam kelompok kecil — terjadwal, fokus, dan saling menjaga." />
            <Link
              href="/dashboard/community/skill-rooms/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Skill Room
            </Link>
          </div>
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
              placeholder="Cari room, skill, atau host..."
              aria-label="Cari skill room"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setType(f.id)}
                aria-pressed={type === f.id}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  type === f.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="w-px h-6 bg-slate-200 mx-1 shrink-0" aria-hidden />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                aria-pressed={status === f.id}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  status === f.id ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {myRooms > 0 && (
            <p className="font-label-code text-[10px] text-slate-400">
              Kamu ikut {myRooms} room · {rooms.length} room tersedia
            </p>
          )}
        </div>
      </Reveal>

      <Reveal>
        {filtered.length === 0 ? (
          <EmptyState
            icon="cast_for_education"
            title="Tidak ada room yang cocok"
            description="Belum ada skill room dengan filter itu. Coba reset filter, atau buat room sendiri — sering kali cuma butuh satu orang buat memulai."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType("semua");
                    setStatus("semua");
                    setQuery("");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Reset filter
                </button>
                <Link
                  href="/dashboard/community/skill-rooms/new"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  Buat Skill Room
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...filtered]
              .sort((a, b) => Number(a.finished ?? false) - Number(b.finished ?? false) || a.inDays - b.inDays)
              .map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}

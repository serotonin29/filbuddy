"use client";

import { useStore, levelOf } from "@/lib/store";
import { getLeaderboard } from "@/lib/leaderboard";
import { initialsOf } from "@/components/app/AppShell";

const ROW_COLORS = [
  "bg-indigo-600",
  "bg-slate-500",
  "bg-amber-600",
  "bg-slate-400",
  "bg-slate-400",
  "bg-slate-400",
  "bg-slate-400",
];

const PODIUM_BADGES = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { user } = useStore();
  if (!user) return null;

  const rows = getLeaderboard(user);
  const myRank = rows.findIndex((r) => r.name === user.name) + 1;
  const podium = [rows[1], rows[0], rows[2]]; // tampil: 2nd, 1st, 3rd
  const rest = rows.slice(3);
  const lv = levelOf(user.points);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Leaderboard Karma 🏆
          </h1>
          <p className="mt-2 font-body-md text-sm text-slate-600">
            Peringkat kontributor teratas komunitas FilBuddy — periode Semester Genap 2025/2026.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live · Diupdate real-time
        </span>
      </div>

      {/* My rank banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 shadow-xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-label-code font-bold uppercase tracking-wider text-indigo-300 mb-1">
              Peringkatmu
            </p>
            <p className="font-headline-lg text-2xl sm:text-3xl font-extrabold">
              #{myRank} <span className="text-base font-semibold text-slate-300">dari {rows.length} mahasiswa</span>
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-center">
              <p className="font-label-code text-lg font-bold text-amber-300">⚡ {user.points}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Karma Pts</p>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="text-center">
              <p className="font-label-code text-lg font-bold text-emerald-300">Lv. {lv.level}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Buddy {lv.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Podium top 3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
        {podium.map((r, i) => {
          const rank = rows.findIndex((x) => x.name === r.name) + 1;
          const isFirst = rank === 1;
          return (
            <div
              key={r.name}
              className={`rounded-2xl border text-center flex flex-col items-center justify-end pt-4 pb-3 px-2 transition-all ${
                isFirst
                  ? "bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-lg shadow-amber-100 py-6 sm:py-8"
                  : "bg-white border-slate-200/90 shadow-xs"
              }`}
            >
              <span className={`mb-2 ${isFirst ? "text-3xl" : "text-2xl"}`}>{PODIUM_BADGES[rank - 1]}</span>
              <div
                className={`${isFirst ? "w-14 h-14 text-base" : "w-11 h-11 text-sm"} rounded-full ${
                  ROW_COLORS[rank - 1]
                } text-white flex items-center justify-center font-headline-sm font-bold`}
              >
                {initialsOf(r.name)}
              </div>
              <p className={`mt-2 font-headline-sm font-bold text-slate-900 truncate max-w-full ${isFirst ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                {r.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-full hidden sm:block">{r.meta}</p>
              <p className={`font-label-code font-bold text-amber-600 mt-1 ${isFirst ? "text-sm" : "text-xs"}`}>
                {r.pts.toLocaleString("id-ID")} Pts
              </p>
            </div>
          );
        })}
      </div>

      {/* Rest of list */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <h2 className="font-headline-sm text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 px-1">
          Peringkat 4 – {rows.length}
        </h2>
        <div className="flex flex-col gap-1.5">
          {rest.map((l, i) => {
            const rank = i + 4;
            const isMe = l.name === user.name;
            return (
              <div
                key={l.name}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  isMe ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span className="font-label-code text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                  {rank}
                </span>
                <div className={`${ROW_COLORS[rank - 1] ?? "bg-slate-400"} w-9 h-9 rounded-lg text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}>
                  {initialsOf(l.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-headline-sm text-sm font-bold text-slate-900">{l.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{l.meta}</span>
                </div>
                {isMe && (
                  <span className="text-[9px] font-label-code font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase shrink-0">
                    Kamu
                  </span>
                )}
                <span className="font-label-code text-xs font-bold text-amber-600 shrink-0">
                  {l.pts.toLocaleString("id-ID")} Pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Karma dihitung dari poin barter, jawaban terbaik di forum, dan rating sesi mengajar.
      </p>
    </div>
  );
}

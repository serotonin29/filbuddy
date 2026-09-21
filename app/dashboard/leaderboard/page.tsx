"use client";

import { useEffect, useState } from "react";
import { useStore, levelOf } from "@/lib/store";
import { getLeaderboard } from "@/lib/leaderboard";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PERIODS,
  SCORE_RULE,
  fetchPeriodLeaderboard,
  type Period,
  type PeriodRow,
} from "@/lib/leaderboardPeriod";
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
  const { user, mode } = useStore();
  const [period, setPeriod] = useState<Period>("30h");
  const [rows, setRows] = useState<PeriodRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetchPeriodLeaderboard(period, user?.id ?? null)
      .then((r) => {
        if (alive) setRows(r);
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [period, user?.id]);

  if (!user) return null;

  // Mode demo: tidak ada data waktu nyata — tampilkan leaderboard statis contoh.
  if (!isSupabaseConfigured) {
    const demoRows = getLeaderboard(user);
    return <DemoBoard rows={demoRows} />;
  }

  const myRank = rows.findIndex((r) => r.me) + 1;
  const myRow = rows.find((r) => r.me) ?? null;
  const podium = rows.slice(0, 3);
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
            Peringkat kontribusi nyata mahasiswa FilBuddy dari aktivitas forum.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Data live · {mode === "supabase" ? "Database" : "Demo"}
        </span>
      </div>

      {/* Period switcher */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              aria-pressed={period === p.id}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                period === p.id
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 font-label-code">{SCORE_RULE}</p>
      </div>

      {loading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center text-sm text-slate-400">
          Memuat peringkat…
        </div>
      )}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-sm text-rose-600 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* My rank banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 shadow-xl">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-label-code font-bold uppercase tracking-wider text-indigo-300 mb-1">
                  Peringkatmu — {PERIODS.find((p) => p.id === period)?.label}
                </p>
                <p className="font-headline-lg text-2xl sm:text-3xl font-extrabold">
                  {myRow ? (
                    <>
                      #{myRank}{" "}
                      <span className="text-base font-semibold text-slate-300">
                        dari {rows.length} kontributor
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-slate-300">
                      Belum berkontribusi periode ini — jawab pertanyaan di forum untuk masuk peringkat
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="text-center">
                  <p className="font-label-code text-lg font-bold text-amber-300">
                    ⚡ {myRow ? myRow.pts : 0}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Karma Periode</p>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center">
                  <p className="font-label-code text-lg font-bold text-emerald-300">Lv. {lv.level}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Buddy {lv.label}</p>
                </div>
              </div>
            </div>
          </div>

          {rows.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300">emoji_events</span>
              <p className="text-sm text-slate-500 mt-2">
                Belum ada kontribusi pada periode ini. Jadilah kontributor pertama!
              </p>
            </div>
          )}

          {/* Podium top 3 */}
          {podium.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
              {podium.map((r) => {
                const rank = rows.indexOf(r) + 1;
                const isFirst = rank === 1;
                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl border text-center flex flex-col items-center justify-end pt-4 pb-3 px-2 transition-all ${
                      isFirst
                        ? "bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-lg shadow-amber-100 py-6 sm:py-8"
                        : "bg-white border-slate-200/90 shadow-xs"
                    }`}
                  >
                    <span className={`mb-2 ${isFirst ? "text-3xl" : "text-2xl"}`}>
                      {PODIUM_BADGES[rank - 1]}
                    </span>
                    <div
                      className={`${isFirst ? "w-14 h-14 text-base" : "w-11 h-11 text-sm"} rounded-full ${
                        ROW_COLORS[rank - 1]
                      } text-white flex items-center justify-center font-headline-sm font-bold`}
                    >
                      {initialsOf(r.name)}
                    </div>
                    <p
                      className={`mt-2 font-headline-sm font-bold text-slate-900 truncate max-w-full ${
                        isFirst ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                      }`}
                    >
                      {r.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-full hidden sm:block">
                      {r.prodi} · {r.best} jawaban terbaik
                    </p>
                    <p
                      className={`font-label-code font-bold text-amber-600 mt-1 ${
                        isFirst ? "text-sm" : "text-xs"
                      }`}
                    >
                      {r.pts.toLocaleString("id-ID")} Pts
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of list */}
          {rest.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="font-headline-sm text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 px-1">
                Peringkat 4 – {rows.length}
              </h2>
              <div className="flex flex-col gap-1.5">
                {rest.map((l) => {
                  const rank = rows.indexOf(l) + 1;
                  return (
                    <div
                      key={l.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        l.me ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span className="font-label-code text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                        {rank}
                      </span>
                      <div
                        className={`${ROW_COLORS[rank - 1] ?? "bg-slate-400"} w-9 h-9 rounded-lg text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}
                      >
                        {initialsOf(l.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-headline-sm text-sm font-bold text-slate-900">{l.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {l.prodi} · {l.questions} pertanyaan · {l.answers} jawaban · {l.best} terbaik
                        </span>
                      </div>
                      {l.me && (
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
          )}

          <p className="text-[11px] text-slate-400 text-center">
            {SCORE_RULE} — dihitung langsung dari aktivitas forum periode terpilih.
          </p>
        </>
      )}
    </div>
  );
}

function DemoBoard({ rows }: { rows: ReturnType<typeof getLeaderboard> }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Leaderboard Karma 🏆
        </h1>
        <p className="mt-2 font-body-md text-sm text-slate-600">
          Peringkat kontributor teratas komunitas FilBuddy.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
        Mode demo: ini data contoh statis. Periode leaderboard dengan data nyata tersedia saat aplikasi
        tersambung ke database.
      </div>
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col gap-1.5">
          {rows.map((l, i) => (
            <div
              key={l.name}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent"
            >
              <span className="font-label-code text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                {i + 1}
              </span>
              <div
                className={`${ROW_COLORS[i] ?? "bg-slate-400"} w-9 h-9 rounded-lg text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}
              >
                {initialsOf(l.name)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-headline-sm text-sm font-bold text-slate-900">{l.name}</span>
                <span className="text-[10px] text-slate-500 block truncate">{l.meta}</span>
              </div>
              <span className="font-label-code text-xs font-bold text-amber-600 shrink-0">
                {l.pts.toLocaleString("id-ID")} Pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

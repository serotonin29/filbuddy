"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";
import { getLeaderboard } from "@/lib/leaderboard";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PERIODS,
  fetchPeriodLeaderboard,
  type Period,
  type PeriodRow,
} from "@/lib/leaderboardPeriod";
import { initialsOf } from "./AppShell";

const ROW_COLORS = [
  "bg-indigo-600",
  "bg-slate-500",
  "bg-amber-600",
  "bg-slate-400",
  "bg-slate-400",
  "bg-slate-400",
  "bg-slate-400",
];

export function KarmaLeaderboard() {
  const { user } = useStore();
  const [period, setPeriod] = useState<Period>("30h");
  const [rows, setRows] = useState<PeriodRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    fetchPeriodLeaderboard(period, user.id ?? null)
      .then((r) => {
        if (alive) setRows(r);
      })
      .catch(() => {
        if (alive) setRows([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [period, user]);

  if (!user) return null;

  const list = isSupabaseConfigured ? rows : getLeaderboard(user).slice(0, 5);
  const metaOf = (r: PeriodRow | { name: string; meta: string }): string =>
    "meta" in r ? r.meta : `${r.prodi} · ${r.questions}T · ${r.answers}J · ${r.best}★`;

  return (
    <Reveal delay={100}>
      <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-headline-sm text-base font-bold text-slate-900">🏆 Leaderboard Karma</h3>
          {isSupabaseConfigured && (
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  aria-pressed={period === p.id}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    period === p.id
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] font-label-code text-slate-400 mb-4">
          {isSupabaseConfigured
            ? "Skor kontribusi nyata dari forum"
            : "Mode demo · data contoh statis"}
        </p>

        {loading && <p className="text-xs text-slate-400 py-4 text-center">Memuat…</p>}
        {!loading && isSupabaseConfigured && list.length === 0 && (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada kontributor pada periode ini.
          </p>
        )}

        {!loading && (
          <div className="flex flex-col gap-1.5">
            {list.map((l, i) => {
              const isMe = "me" in l ? l.me : l.name === user.name;
              return (
                <div
                  key={"id" in l ? l.id : l.name}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    isMe ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span className="font-label-code text-xs font-bold text-slate-400 w-4 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-lg ${ROW_COLORS[i] ?? "bg-slate-400"} text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}
                  >
                    {initialsOf(l.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-sm font-bold text-slate-900 truncate">
                        {l.name}
                      </span>
                      {i === 0 && <span className="text-xs">👑</span>}
                      {isMe && (
                        <span className="text-[9px] font-label-code font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase">
                          Kamu
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{metaOf(l)}</span>
                  </div>
                  <span className="font-label-code text-xs font-bold text-amber-600 shrink-0">
                    {l.pts.toLocaleString("id-ID")} Pts
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <a
          href="/dashboard/leaderboard"
          className="mt-4 text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 transition-colors"
        >
          Lihat Leaderboard Lengkap <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </section>
    </Reveal>
  );
}

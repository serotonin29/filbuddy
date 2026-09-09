"use client";

import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";
import { getLeaderboard } from "@/lib/leaderboard";
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
  if (!user) return null;

  const rows = getLeaderboard(user).slice(0, 5);

  return (
    <Reveal delay={100}>
      <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <h3 className="font-headline-sm text-base font-bold text-slate-900 mb-1">🏆 Leaderboard Karma</h3>
        <p className="text-[10px] font-label-code text-slate-400 mb-4">Periode Semester Genap · UPI YPTK</p>

        <div className="flex flex-col gap-1.5">
          {rows.map((l, i) => {
            const isMe = l.name === user.name;
            return (
              <div
                key={l.name}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  isMe ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span className="font-label-code text-xs font-bold text-slate-400 w-4 text-center shrink-0">
                  {i + 1}
                </span>
                <div className={`w-9 h-9 rounded-lg ${ROW_COLORS[i] ?? "bg-slate-400"} text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}>
                  {initialsOf(l.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-sm font-bold text-slate-900 truncate">{l.name}</span>
                    {i === 0 && <span className="text-xs">👑</span>}
                    {isMe && (
                      <span className="text-[9px] font-label-code font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase">
                        Kamu
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">{l.meta}</span>
                </div>
                <span className="font-label-code text-xs font-bold text-amber-600 shrink-0">
                  {l.pts.toLocaleString("id-ID")} Pts
                </span>
              </div>
            );
          })}
        </div>

        <a href="/dashboard/leaderboard" className="mt-4 text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 transition-colors">
          Lihat Leaderboard Lengkap <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </section>
    </Reveal>
  );
}

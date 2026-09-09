"use client";

import { useState } from "react";
import { useStore, levelOf } from "@/lib/store";
import { SlotModal } from "./SlotModal";

export function DashboardHero() {
  const { user, slots } = useStore();
  const [openSlot, setOpenSlot] = useState(false);
  if (!user) return null;

  const lv = levelOf(user.points);
  const progress = Math.min(
    100,
    Math.round(((user.points - lv.floor) / (lv.next - lv.floor)) * 100)
  );
  const waiting = slots.filter((s) => s.status === "waiting").length;
  const scheduled = slots.filter((s) => s.status === "scheduled" || s.status === "live").length;
  const circumference = 2 * Math.PI * 40;
  const dash = (progress / 100) * circumference;

  return (
    <>
      <section className="relative rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 overflow-hidden p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-[float-reverse_12s_ease-in-out_infinite]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-[11px] font-semibold text-emerald-300 mb-4">
              <span>✨ Sesi Semester Genap 2025/2026</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 animate-[fade-up_0.6s_ease-out_both]">
              Selamat datang kembali, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="font-body-md text-slate-300 text-sm sm:text-base leading-relaxed mb-6 animate-[fade-up_0.6s_ease-out_both] [animation-delay:120ms]">
              Kamu punya{" "}
              <strong className="text-white">{waiting} permintaan barter menunggu</strong> dan{" "}
              <strong className="text-white">{scheduled} sesi terjadwal</strong> minggu ini di kampus UPI YPTK.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-[fade-up_0.6s_ease-out_both] [animation-delay:240ms]">
              <button
                onClick={() => setOpenSlot(true)}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-headline-sm text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Buka Slot Barter Baru
              </button>
              <a
                href="/dashboard/slot"
                className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-headline-sm text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                Jadwal Saya
              </a>
            </div>
          </div>

          {/* Level ring */}
          <div className="flex items-center gap-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 lg:min-w-[300px] animate-[fade-up_0.6s_ease-out_both] [animation-delay:360ms]">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - dash}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-label-code text-[10px] text-slate-300 uppercase tracking-wider">Level Buddy</span>
                <span className="font-headline-lg text-xl font-extrabold text-white">{lv.level}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-code text-xs text-slate-300">
                {user.points} / {lv.next} Pts
              </span>
              <span className="font-headline-sm text-sm font-bold text-white">Progress: {progress}%</span>
              <span className="text-[11px] text-emerald-300 font-semibold">Menuju {lv.label}</span>
              <span className="text-[11px] text-slate-400">Target: Level {lv.level + 1}</span>
              <a href="#" className="mt-1.5 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 transition-colors">
                Lihat badge <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <SlotModal open={openSlot} onClose={() => setOpenSlot(false)} />
    </>
  );
}

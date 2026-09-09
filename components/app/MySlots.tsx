"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useStore, type SlotStatus } from "@/lib/store";

type TabFilter = "Semua" | "Aktif" | "Menunggu";

const statusStyles: Record<SlotStatus, { pill: string; icon: string; label: (s: { schedule: string }) => string }> = {
  live: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "text-emerald-500", label: () => "🔴 LIVE SEKARANG" },
  scheduled: { pill: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "text-indigo-500", label: () => "TERJADWAL" },
  waiting: { pill: "bg-amber-50 text-amber-700 border-amber-200", icon: "text-amber-500", label: () => "MENUNGGU RESPON" },
};

export function MySlots() {
  const { slots, cancelSlot, joinSession } = useStore();
  const [tab, setTab] = useState<TabFilter>("Semua");

  const counts = {
    Semua: slots.length,
    Aktif: slots.filter((s) => s.status === "live" || s.status === "scheduled").length,
    Menunggu: slots.filter((s) => s.status === "waiting").length,
  };

  const tabs: { label: TabFilter; count: number }[] = [
    { label: "Semua", count: counts.Semua },
    { label: "Aktif", count: counts.Aktif },
    { label: "Menunggu", count: counts.Menunggu },
  ];

  const filtered = slots.filter((s) => {
    if (tab === "Semua") return true;
    if (tab === "Aktif") return s.status === "live" || s.status === "scheduled";
    return s.status === "waiting";
  });

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-headline-sm text-lg font-bold text-slate-900">Slot Barter Saya</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTab(t.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.label
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
              }`}
            >
              {t.label}{" "}
              <span className={`font-label-code ${tab === t.label ? "text-indigo-200" : "text-slate-400"}`}>
                ({t.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-300">inventory_2</span>
            <p className="text-sm text-slate-500 mt-2">Belum ada slot di kategori ini.</p>
          </div>
        )}
        {filtered.map((slot, i) => {
          const st = statusStyles[slot.status];
          return (
            <Reveal key={slot.id} delay={Math.min(i * 80, 300)}>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center gap-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${st.pill}`}>
                  <span className={`material-symbols-outlined text-[20px] ${st.icon} ${slot.status === "live" ? "animate-pulse" : ""}`}>
                    {slot.status === "live" ? "podcasts" : slot.status === "scheduled" ? "event" : "hourglass_top"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-label-code font-bold border ${st.pill}`}>
                      {st.label(slot)}
                    </span>
                    <span className="text-[10px] text-slate-400">{slot.note}</span>
                  </div>
                  <h3 className="font-headline-sm text-sm font-bold text-slate-900 truncate">{slot.title}</h3>
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {slot.schedule}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">person</span>
                      {slot.partnerLabel} <strong className="text-slate-700">{slot.partner}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  {slot.status === "live" && (
                    <button
                      onClick={() => joinSession(slot.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">video_call</span>
                      Masuk Google Meet
                    </button>
                  )}
                  {slot.status === "scheduled" && (
                    <button
                      onClick={() => cancelSlot(slot.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">event</span>
                      Reschedule / Detail
                    </button>
                  )}
                  {slot.status === "waiting" && (
                    <button
                      onClick={() => cancelSlot(slot.id)}
                      className="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

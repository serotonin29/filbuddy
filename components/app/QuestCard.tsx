"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";
import { SlotModal } from "./SlotModal";

export function QuestCard() {
  const { user, slots } = useStore();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const openedThisMonth = 2 + slots.filter((s) => s.status === "scheduled").length;
  const target = 5;
  const progress = Math.min(100, Math.round((openedThisMonth / target) * 100));

  return (
    <Reveal delay={300}>
      <section className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-sm text-base font-bold">🌟 Quest Mahasiswa</h3>
            <span className="text-[10px] font-label-code font-bold px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
              Sisa 12 Hari
            </span>
          </div>
          <p className="font-headline-sm text-sm font-bold text-emerald-100 mb-2">Jadi Mentor of the Month!</p>
          <p className="text-xs text-emerald-50/90 leading-relaxed mb-4">
            Buka 3 slot belajar lagi bulan ini untuk klaim badge eksklusif &amp; sertifikat resmi FILKOM UPI YPTK.
          </p>

          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] font-label-code font-bold mb-1.5">
              <span>Progress Sesi</span>
              <span>
                {openedThisMonth} / {target} Selesai ({progress}%)
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="mt-3 w-full py-2.5 rounded-xl bg-white text-emerald-700 font-label-ui text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Buka Slot Sekarang
          </button>
        </div>
      </section>

      <SlotModal open={open} onClose={() => setOpen(false)} />
    </Reveal>
  );
}

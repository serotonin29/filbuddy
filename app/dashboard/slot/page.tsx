"use client";

import { useState } from "react";
import { MySlots } from "@/components/app/MySlots";
import { SlotModal } from "@/components/app/SlotModal";

export default function SlotPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Slot Barter Saya 📅
          </h1>
          <p className="mt-2 font-body-md text-sm text-slate-600">
            Kelola semua sesi barter kamu — aktif, menunggu konfirmasi, dan jadwal mendatang.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-headline-sm text-sm font-bold shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buka Slot Barter
        </button>
      </div>
      <MySlots />
      <SlotModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

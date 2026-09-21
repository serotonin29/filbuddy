"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

export function SlotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createSlot, user } = useStore();
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");
  const [partner, setPartner] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("Online (Google Meet)");
  const backdropDown = useRef(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !user) return null;

  const skillOptions = user.teachSkills.map((s) => s.name);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || skill;
    if (!finalTitle) return;
    const schedule = [date, time].filter(Boolean).join(", ") || "Jadwal menyusul";
    createSlot({
      title: finalTitle,
      schedule,
      partner: partner.trim() || "Menunggu partner",
      mode,
    });
    setTitle("");
    setSkill("");
    setPartner("");
    setDate("");
    setTime("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        backdropDown.current = e.target === e.currentTarget;
      }}
      onClick={() => {
        if (backdropDown.current) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-[fade-up_0.3s_ease-out_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-slate-900">Buka Slot Barter Baru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tawarkan sesi mengajar ke teman se-Filkom.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Skill yang Diajarkan
            </label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
            >
              <option value="">Pilih skill atau tulis manual...</option>
              {skillOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Judul Sesi (opsional kalau sudah pilih skill)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Praktikum Routing Laravel dasar"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Jam</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Partner (opsional)
            </label>
            <input
              type="text"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="cth. Diki Wahyudi (SI '21)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {["Online (Google Meet)", "Tatap Muka", "Hybrid"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-2 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                    mode === m
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!title.trim() && !skill}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              Buka Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

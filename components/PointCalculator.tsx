"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";

const skillOptions = [
  { label: "Web Dev (Laravel / React / Vue) — ~40 Pts/jam", rate: 40 },
  { label: "Mobile Dev (Flutter / Kotlin) — ~40 Pts/jam", rate: 40 },
  { label: "UI/UX Design (Figma) — ~35 Pts/jam", rate: 35 },
  { label: "Jaringan Komputer & Packet Tracer — ~35 Pts/jam", rate: 35 },
  { label: "Basis Data & SQL Query — ~30 Pts/jam", rate: 30 },
] as const;

export function PointCalculator() {
  const [hours, setHours] = useState(2);
  const [rate, setRate] = useState<number>(skillOptions[0].rate);

  const earned = hours * rate;
  const exchanges = [
    { label: "1 Jam Mentoring Desain UI/UX Figma", cost: 40 },
    { label: "1 Jam Simulasi Cisco Packet Tracer", cost: 40 },
  ];

  return (
    <section id="kalkulator-section" className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Reveal>
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-lg shadow-indigo-100/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="font-label-code text-xs text-emerald-600 font-bold uppercase tracking-widest">
              SIMULASI VALUE FILBUDDY
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-slate-900">
              Kalkulator Barter Poin Filkom
            </h2>
            <p className="font-body-md text-sm sm:text-base text-slate-600 leading-relaxed">
              Hitung seberapa banyak ilmu baru yang bisa kamu dapatkan tanpa
              mengeluarkan uang satu rupiah pun. Cukup sumbangkan waktu
              keahlianmu ke sesama mahasiswa UPI YPTK.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-ui text-xs sm:text-sm font-semibold text-slate-900">
                    Waktu Mengajar per Minggu
                  </label>
                  <span className="font-label-code text-sm text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {hours} Jam
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <label className="font-label-ui text-xs sm:text-sm font-semibold text-slate-900 block mb-1.5">
                  Keahlian yang Kamu Tawarkan
                </label>
                <select
                  onChange={(e) => setRate(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 font-body-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {skillOptions.map((opt) => (
                    <option key={opt.label} value={opt.rate}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <span className="font-label-code text-xs text-slate-500 uppercase font-semibold">
                Hasil Simulasi Pertukaran
              </span>
              <span className="font-label-karma text-xs font-bold text-emerald-700">REAL-TIME CONVERSION</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/80 mb-4 shadow-xs">
              <div className="flex flex-col">
                <span className="font-body-sm text-xs text-slate-500">Estimasi Poin Diperoleh:</span>
                <span key={earned} className="font-headline-lg text-3xl font-extrabold text-emerald-600 inline-block animate-[fade-up_0.35s_ease-out_both]">
                  +{earned} Pts
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-label-ui text-xs font-semibold text-slate-800 block mb-1">
                Bisa Ditukar Langsung Dengan:
              </span>
              {exchanges.map((ex) => (
                <div key={ex.label} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${earned >= ex.cost ? "bg-indigo-600" : "bg-slate-300"}`} />
                    <span className="font-body-sm text-xs sm:text-sm text-slate-700 font-medium">{ex.label}</span>
                  </div>
                  <span className="font-label-code text-xs text-amber-700 font-bold">-{ex.cost} Pts</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-700 text-lg">savings</span>
              <p className="font-body-sm text-xs text-emerald-800 font-medium">
                Biaya Les / Joki Tugas: <strong className="font-bold">Rp 0,- (GRATIS 100%)</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}

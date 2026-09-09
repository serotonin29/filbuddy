"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";

const matches = [
  {
    initials: "RD",
    initialsClass: "bg-indigo-600",
    name: "Rahmat Danu",
    tag: "IF '22",
    rating: "4.9",
    meta: "Fakultas Ilmu Komputer · Minat Web & Backend Systems",
    matchScore: "Match 92%",
    teach: "Laravel & REST API",
    teachLevel: "Tingkat: Mahir",
    need: "UI/UX Figma",
    needNote: "✨ Cocok dengan skillmu!",
    mode: "Hybrid (Perpus UPI YPTK / Discord)",
  },
  {
    initials: "FA",
    initialsClass: "bg-slate-700",
    name: "Fajar Alamsyah",
    tag: "SK '21",
    rating: "4.8",
    meta: "Fakultas Ilmu Komputer · Sistem Komputer & Jaringan",
    matchScore: "Match 87%",
    teach: "Jaringan Komputer & Mikrotik",
    teachLevel: "Lab Cisco UPI",
    need: "Desain Grafis / Prototyping",
    needNote: "✨ Sesuai Portofoliomu",
    mode: "Tatap Muka Kampus (Gedung FILKOM)",
  },
] as const;

export function MatchRecommendations() {
  const { requestBarter } = useStore();
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");

  const visibleMatches = matches.filter(
    (m) =>
      !filter ||
      m.name.toLowerCase().includes(filter.toLowerCase()) ||
      m.teach.toLowerCase().includes(filter.toLowerCase()) ||
      m.need.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="font-headline-sm text-lg font-bold text-slate-900">Rekomendasi Match Hari Ini</h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-label-code font-bold text-indigo-600">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
            Smart Algorithm
          </span>
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter match..."
          className="sm:w-56 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-4">
        {visibleMatches.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <p className="text-sm text-slate-500">Tidak ada match untuk filter &ldquo;{filter}&rdquo;.</p>
          </div>
        )}
        {visibleMatches.map((m, i) => (
          <Reveal key={m.name} delay={i * 120}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Profile */}
                <div className="flex items-start gap-3 md:w-56 shrink-0">
                  <div className={`w-12 h-12 rounded-xl ${m.initialsClass} text-white flex items-center justify-center font-headline-sm text-sm font-bold shrink-0`}>
                    {m.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-headline-sm text-sm font-bold text-slate-900">{m.name}</span>
                      <span className="font-label-code text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{m.tag}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {m.rating}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug mt-1 hidden lg:block">{m.meta}</p>
                  </div>
                </div>

                {/* Exchange */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <p className="text-[10px] font-label-code font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[13px]">school</span>
                      Diajarkan oleh {m.name.split(" ")[0]}:
                    </p>
                    <p className="font-headline-sm text-sm font-bold text-slate-900">{m.teach}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{m.teachLevel}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <p className="text-[10px] font-label-code font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[13px]">handshake</span>
                      Dibutuhkan oleh {m.name.split(" ")[0]}:
                    </p>
                    <p className="font-headline-sm text-sm font-bold text-slate-900">{m.need}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{m.needNote}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 md:w-40 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-label-code font-bold text-emerald-700">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    {m.matchScore}
                  </span>
                  <div className="flex flex-col items-end md:items-center gap-1.5 w-full">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 hidden md:flex">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span className="max-w-[140px] truncate">{m.mode}</span>
                    </span>
                    <button
                      onClick={() => {
                        requestBarter(m.name, m.teach, m.need);
                        setSent((s) => ({ ...s, [m.name]: true }));
                      }}
                      disabled={sent[m.name]}
                      className="w-full md:w-auto px-4 py-2 rounded-xl bg-indigo-600 text-white font-label-ui text-xs font-bold hover:bg-indigo-700 disabled:bg-emerald-600 disabled:cursor-default shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {sent[m.name] ? "check_circle" : "send"}
                      </span>
                      {sent[m.name] ? "Permintaan Terkirim" : "Ajak Barter"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

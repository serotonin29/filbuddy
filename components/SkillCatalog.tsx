"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";

const tabs = [
  "Semua Skill",
  "Web Dev & Backend",
  "Mobile & AI",
  "UI/UX Design",
  "Database & Jaringan",
  "Matkul Teori & Algoritma",
];

const skills = [
  {
    badge: "Tersedia Malam Ini",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    points: "⚡ 40 Pts/jam",
    title: "Debugging Flutter & Firebase State Management",
    description: "Bimbingan sinkronisasi async data, bloc/provider, dan penanganan bug build apk.",
    mentor: "Fikri Ilham",
    mentorMeta: "IF '21 • ⭐ 4.9",
    initials: "FI",
    initialsClass: "bg-indigo-100 text-indigo-700",
  },
  {
    badge: "Favorit Maba",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    points: "⚡ 35 Pts/jam",
    title: "Figma Component Architecture & Design System",
    description: "Belajar bikin UI kit seragam, auto-layout advanced, dan token warna siap handoff dev.",
    mentor: "Nadia Fitria",
    mentorMeta: "SI '22 • ⭐ 5.0",
    initials: "NA",
    initialsClass: "bg-emerald-100 text-emerald-700",
  },
  {
    badge: "Persiapan UAS",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
    points: "⚡ 30 Pts/jam",
    title: "Optimalisasi Query SQL & ERD Kompleks",
    description: "Normalisasi 1NF-3NF, indexing MySQL, dan trik query agregasi nilai praktikum.",
    mentor: "Budi Pratama",
    mentorMeta: "SK '22 • ⭐ 4.8",
    initials: "BP",
    initialsClass: "bg-amber-100 text-amber-700",
  },
  {
    badge: "Tugas Akhir Ready",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    points: "⚡ 45 Pts/jam",
    title: "Dasar Machine Learning Python & Pandas",
    description: "Data cleaning, training model klasifikasi scikit-learn, & visualisasi matplotlib.",
    mentor: "Andre Wijaya",
    mentorMeta: "IF '21 • ⭐ 5.0",
    initials: "AW",
    initialsClass: "bg-slate-100 text-slate-700",
  },
] as const;

export function SkillCatalog() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section id="katalog-skill" className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-label-code text-xs text-emerald-700 font-bold uppercase tracking-wider">
              LIVE MENTOR EXCHANGE
            </span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-slate-900">
            Kategori Skill Terpopuler di Kampus
          </h2>
        </div>
        <p className="font-body-sm text-slate-600 text-sm max-w-sm">
          Slot mentoring terbuka saat ini dari kawan-kawan Informatika, Sistem
          Informasi, &amp; Sistem Komputer.
        </p>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none" id="katalog-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? "px-4 py-2 rounded-xl bg-indigo-600 text-white font-label-ui text-xs sm:text-sm font-semibold shrink-0 shadow-sm"
                : "px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50 font-label-ui text-xs sm:text-sm font-medium shrink-0 transition-colors"
            }
          >
            {tab}
          </button>
        ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {skills.map((skill, i) => (
          <Reveal key={skill.title} delay={i * 110} className="h-full">
            <div
              className="h-full rounded-2xl bg-white border border-slate-200/90 p-5 flex flex-col justify-between shadow-xs hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1.5 transition-all duration-300 group"
            >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded font-label-karma text-[10px] font-bold border ${skill.badgeClass}`}>
                  {skill.badge}
                </span>
                <span className="font-label-karma text-xs font-bold text-amber-600">{skill.points}</span>
              </div>
              <h4 className="font-headline-sm text-base font-bold text-slate-900 mt-1 leading-snug">
                {skill.title}
              </h4>
              <p className="font-body-sm text-xs text-slate-600 leading-relaxed">{skill.description}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-full ${skill.initialsClass} flex items-center justify-center font-bold text-xs`}>
                  {skill.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-ui text-xs font-semibold text-slate-900 truncate">{skill.mentor}</span>
                  <span className="font-label-code text-[10px] text-slate-500">{skill.mentorMeta}</span>
                </div>
              </div>
              <button className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-label-code text-xs font-semibold border border-indigo-100 transition-colors">
                Barter
              </button>
            </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

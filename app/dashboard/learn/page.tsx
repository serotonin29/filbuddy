"use client";

// ============================================================
// Kelas Belajar â€” daftar kursus video (ala Udemy ringkas)
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLearn } from "@/lib/learnStore";
import { CATEGORIES } from "@/lib/storeTypes";

export default function LearnListPage() {
  const { ready, courses, lessons, counts, mode } = useLearn();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Semua");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (cat !== "Semua" && c.category !== cat) return false;
      if (!needle) return true;
      return `${c.title} ${c.description} ${c.authorName}`.toLowerCase().includes(needle);
    });
  }, [courses, q, cat]);

  const countLessons = (courseId: string) => counts[courseId] ?? lessons.filter((l) => l.courseId === courseId).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-label-code text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Learn &amp; Share</p>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Kelas Belajar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tonton materi video dari sesama Filkom &mdash; video &amp; subtitle tersaji lewat Google Drive.
          </p>
        </div>
        <Link
          href="/dashboard/learn/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buat Kursus
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, topik, atau pembuat kelasâ€¦"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 -mt-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              cat === c
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Daftar kursus */}
      {!ready ? (
        <div className="py-16 flex justify-center">
          <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 flex flex-col items-center gap-3 text-center px-6">
          <span className="material-symbols-outlined text-5xl text-slate-300">school</span>
          <p className="font-headline-sm font-bold text-slate-800">
            {courses.length === 0 ? "Belum ada kelas" : "Tidak ada kelas yang cocok"}
          </p>
          <p className="text-sm text-slate-500 max-w-md">
            {courses.length === 0
              ? "Jadilah yang pertama membagikan materi video â€” tempel link Google Drive-mu, subtitle pun didukung."
              : "Coba kata kunci lain atau pilih kategori berbeda."}
          </p>
          {courses.length === 0 && (
            <Link
              href="/dashboard/learn/new"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Kursus Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/learn/${c.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-code text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {c.category}
                </span>
                <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-indigo-500 transition-colors">
                  play_circle
                </span>
              </div>
              <h2 className="font-headline-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">
                {c.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{c.description || "Tanpa deskripsi."}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">oleh {c.authorName}</span>
                <span className="font-label-code font-bold text-slate-500 shrink-0">
                  {countLessons(c.id)} video
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {mode === "demo" && ready && courses.length > 0 && (
        <p className="text-[11px] text-slate-400 font-label-code">
          MODE LOKAL â€” kursus tersimpan di browser ini saja. Jalankan supabase/learn_tables.sql di Supabase agar tersimpan permanen.
        </p>
      )}
    </div>
  );
}

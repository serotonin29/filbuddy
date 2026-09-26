"use client";

// ============================================================
// Buat Kursus — form ringkas; setelah dibuat lanjut ke detail
// untuk menambah video dari Google Drive.
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearn } from "@/lib/learnStore";
import { CATEGORIES } from "@/lib/storeTypes";

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse } = useLearn();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Web Dev");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await createCourse({ title, description, category });
    setSaving(false);
    if (!res.ok || !res.id) {
      setError(res.error ?? "Gagal membuat kursus.");
      return;
    }
    router.push(`/dashboard/learn/${res.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <Link href="/dashboard/learn" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Semua kelas
        </Link>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">Buat Kursus Baru</h1>
        <p className="text-sm text-slate-500 mt-1">
          Setelah kursus jadi, tambahkan video satu per satu — cukup tempel link share Google Drive.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-5">
        <div>
          <label htmlFor="course-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Judul kursus
          </label>
          <input
            id="course-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth. React Dasar untuk Pemula"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <div>
          <label htmlFor="course-desc" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Deskripsi <span className="text-slate-400 normal-case font-medium">(opsional)</span>
          </label>
          <textarea
            id="course-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Apa yang akan dipelajari penonton dari kursus ini?"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <div>
          <label htmlFor="course-cat" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Kategori
          </label>
          <select
            id="course-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          >
            {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          )}
          Buat Kursus
        </button>
      </form>
    </div>
  );
}

"use client";

// ============================================================
// Kelas Belajar — daftar kursus video (ala Udemy ringkas)
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLearn } from "@/lib/learnStore";
import { CATEGORIES } from "@/lib/storeTypes";
import { parseFolderId } from "@/lib/drive";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY ?? "";
const DEFAULT_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID ?? "";

function ImportFolderCard() {
  const { syncFolder } = useLearn();
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState(DEFAULT_FOLDER);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const fid = parseFolderId(folder);
    if (!fid) {
      setMsg({ kind: "err", text: "Tempel link folder Google Drive (…/folders/…) atau ID folder-nya." });
      return;
    }
    setBusy(true);
    const res = await syncFolder(fid);
    setBusy(false);
    if (!res.ok) {
      setMsg({
        kind: "err",
        text:
          res.error === "NO_API_KEY"
            ? "API key Google Drive belum diisi — lihat panduan di atas."
            : res.error ?? "Import gagal.",
      });
      return;
    }
    setMsg({ kind: "ok", text: `Berhasil! ${res.courses} kursus (${res.lessons} video) ditambahkan dari folder.` });
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-headline-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-indigo-500">cloud_sync</span>
            Tampilkan isi Folder Google Drive
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Tempel link folder Drive — subfolder jadi kursus, file video jadi pelajaran, subtitle{" "}
            <code className="font-label-code">.srt/.vtt</code> dipasangkan otomatis per nama file. Import ulang folder yang sama
            akan menyegarkan daftar (progress penonton pada video yang tetap ada tidak hilang).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          {open ? "Tutup" : "Import Folder"}
          <span className="material-symbols-outlined text-[16px]">{open ? "expand_less" : "expand_more"}</span>
        </button>
      </div>

      {open &&
        (!API_KEY ? (
          <div className="mt-4 rounded-xl bg-white border border-amber-200 p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Butuh Google Drive API key (sekali saja)</p>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-5">
              <li>
                Buka{" "}
                <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">
                  console.cloud.google.com
                </a>{" "}
                → pilih/buat project → aktifkan <strong>Google Drive API</strong>.
              </li>
              <li>Menu Credentials → Create credentials → <strong>API key</strong>.</li>
              <li>(Disarankan) Klik key → Application restrictions → HTTP referrers → isi domain situsmu.</li>
              <li>
                Isi ke file <code className="font-label-code">.env.local</code> sebagai{" "}
                <code className="font-label-code">NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=…</code> lalu rebuild.
              </li>
            </ol>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/…"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors shrink-0"
            >
              {busy ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">cloud_download</span>
              )}
              Pindai &amp; Import
            </button>
          </form>
        ))}

      {msg && (
        <p
          className={`mt-3 text-xs font-semibold rounded-xl px-3 py-2 border ${
            msg.kind === "ok" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

export default function LearnListPage() {
  const { ready, courses, lessons, mode } = useLearn();
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

  const countLessons = (courseId: string) => lessons.filter((l) => l.courseId === courseId).length;

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

      <ImportFolderCard />

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, topik, atau pembuat kelas…"
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
              ? "Jadilah yang pertama membagikan materi video — tempel link Google Drive-mu, subtitle pun didukung."
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
          MODE LOKAL — kursus tersimpan di browser ini saja. Jalankan supabase/learn_tables.sql di Supabase agar tersimpan permanen.
        </p>
      )}
    </div>
  );
}

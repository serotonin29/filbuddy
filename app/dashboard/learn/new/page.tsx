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
import { parseFolderId } from "@/lib/drive";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY ?? "";
const DEFAULT_FOLDER = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID ?? "";

/** Panel import otomatis dari folder Google Drive — khusus pembuat konten. */
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
            ? "API key Google Drive belum diisi — lihat panduan di bawah."
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
            Import Kursus dari Folder Google Drive
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
              type="password"
              autoComplete="off"
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

      <ImportFolderCard />
    </div>
  );
}

"use client";

// ============================================================
// Detail Kursus — player ala Udemy: playlist + progres selesai.
// Playlist dikelompokkan per section/bab (hasil import folder),
// materi PDF bisa dibuka (viewer Drive), subtitle bisa diterjemahkan
// otomatis ke Bahasa Indonesia via AI (penulis kursus).
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLearn } from "@/lib/learnStore";
import { useStore } from "@/lib/store";
import { aiReady } from "@/lib/ai";
import type { LearnLesson } from "@/lib/learnTypes";
import { VideoPlayer } from "@/components/learn/VideoPlayer";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useStore();
  const { ready, mode, courses, lessons, materials, done, addLesson, deleteLesson, deleteCourse, toggleDone, translateSubtitle } =
    useLearn();

  const course = courses.find((c) => c.id === params.id);
  const courseLessons = useMemo(
    () => lessons.filter((l) => l.courseId === params.id).sort((a, b) => a.position - b.position),
    [lessons, params.id]
  );
  const courseMaterials = useMemo(
    () => materials.filter((m) => m.courseId === params.id).sort((a, b) => a.position - b.position),
    [materials, params.id]
  );

  // Kelompokkan video per section (urutan kemunculan di DB)
  const groups = useMemo(() => {
    if (!courseLessons.some((l) => l.section)) return null;
    const out: Array<{ name: string; items: LearnLesson[] }> = [];
    const byName = new Map<string, { name: string; items: LearnLesson[] }>();
    for (const l of courseLessons) {
      const key = l.section ?? "Lainnya";
      let g = byName.get(key);
      if (!g) {
        g = { name: key, items: [] };
        byName.set(key, g);
        out.push(g);
      }
      g.items.push(l);
    }
    return out;
  }, [courseLessons]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const idxMap = useMemo(() => new Map(courseLessons.map((l, i) => [l.id, i] as const)), [courseLessons]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = courseLessons.find((l) => l.id === activeId) ?? courseLessons[0] ?? null;

  // Viewer PDF
  const [pdf, setPdf] = useState<{ id: string; title: string } | null>(null);

  // Terjemahan AI
  const [translating, setTranslating] = useState(false);
  const [transProg, setTransProg] = useState({ done: 0, total: 0 });
  const [transError, setTransError] = useState("");
  const runTranslate = async () => {
    if (!active) return;
    setTransError("");
    setTranslating(true);
    const res = await translateSubtitle(active.id, (d, t) => setTransProg({ done: d, total: t }));
    setTranslating(false);
    if (!res.ok) {
      setTransError(res.error === "NO_AI_CONFIG" ? "Konfigurasi AI belum diisi di server." : res.error ?? "Gagal menerjemahkan.");
    }
  };

  // Form tambah video (penulis)
  const [lTitle, setLTitle] = useState("");
  const [lVideo, setLVideo] = useState("");
  const [lSub, setLSub] = useState("");
  const [lError, setLError] = useState("");
  const [adding, setAdding] = useState(false);

  // Konfirmasi hapus (dua langkah, tanpa window.confirm)
  const [confirmLessonId, setConfirmLessonId] = useState<string | null>(null);
  const [confirmCourse, setConfirmCourse] = useState(false);
  const [delError, setDelError] = useState("");

  const isAuthor = mode === "demo" ? true : !!user?.id && course?.authorId === user.id;

  const doneCount = courseLessons.filter((l) => done[l.id]).length;
  const pct = courseLessons.length ? Math.round((doneCount / courseLessons.length) * 100) : 0;

  const submitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setLError("");
    setAdding(true);
    const res = await addLesson(course.id, { title: lTitle, video: lVideo, subtitle: lSub || undefined });
    setAdding(false);
    if (!res.ok) {
      setLError(res.error ?? "Gagal menambah video.");
      return;
    }
    setLTitle("");
    setLVideo("");
    setLSub("");
  };

  const removeLesson = async (lessonId: string) => {
    if (!course) return;
    setDelError("");
    const res = await deleteLesson(course.id, lessonId);
    if (!res.ok) setDelError(res.error ?? "Gagal menghapus video.");
    setConfirmLessonId(null);
  };

  const removeCourse = async () => {
    if (!course) return;
    setDelError("");
    const res = await deleteCourse(course.id);
    if (!res.ok) {
      setDelError(res.error ?? "Gagal menghapus kursus.");
      setConfirmCourse(false);
      return;
    }
    router.push("/dashboard/learn");
  };

  const renderLesson = (l: LearnLesson) => {
    const i = idxMap.get(l.id) ?? 0;
    const isActive = active?.id === l.id;
    return (
      <div key={l.id} className={`rounded-xl border transition-colors ${isActive ? "border-indigo-200 bg-indigo-50/70" : "border-transparent hover:bg-slate-50"}`}>
        <button
          type="button"
          onClick={() => setActiveId(l.id)}
          className="w-full flex items-start gap-2.5 p-2.5 text-left"
        >
          <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${done[l.id] ? "text-emerald-500" : isActive ? "text-indigo-500" : "text-slate-300"}`}>
            {done[l.id] ? "check_circle" : "play_circle"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-label-code text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>
            <span className={`block text-xs font-semibold leading-snug ${isActive ? "text-indigo-800" : "text-slate-700"}`}>
              {l.title}
            </span>
          </span>
        </button>
        {isAuthor && (
          <div className="px-2.5 pb-2 -mt-1 flex justify-end">
            {confirmLessonId === l.id ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void removeLesson(l.id)}
                  className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 hover:bg-rose-100 transition-colors"
                >
                  Yakin hapus?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLessonId(null)}
                  className="text-[10px] font-semibold text-slate-500 hover:underline"
                >
                  Batal
                </button>
              </span>
            ) : (
              <button
                type="button"
                aria-label={`Hapus video ${l.title}`}
                onClick={() => setConfirmLessonId(l.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!ready) {
    return (
      <div className="py-16 flex justify-center">
        <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 flex flex-col items-center gap-3 text-center px-6">
        <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
        <p className="font-headline-sm font-bold text-slate-800">Kursus tidak ditemukan</p>
        <p className="text-sm text-slate-500">Mungkin sudah dihapus atau tautannya salah.</p>
        <Link
          href="/dashboard/learn"
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Kelas Belajar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <Link href="/dashboard/learn" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Semua kelas
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-label-code text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {course.category}
          </span>
          <span className="text-[11px] text-slate-400">oleh {course.authorName}</span>
          {isAuthor && (
            <span className="font-label-code text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              KURSUMU
            </span>
          )}
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{course.title}</h1>
        {course.description && <p className="text-sm text-slate-500 mt-1 max-w-3xl">{course.description}</p>}

        {/* Progres */}
        <div className="mt-4 max-w-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>
              {doneCount} dari {courseLessons.length} video selesai
            </span>
            <span className="font-label-code">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Player + meta */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {active ? (
            <>
              <VideoPlayer lesson={active} onEnded={() => { if (!done[active.id]) void toggleDone(active.id); }} />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-label-code text-[10px] font-bold text-slate-400 uppercase">
                    Video {courseLessons.findIndex((l) => l.id === active.id) + 1} dari {courseLessons.length}
                  </p>
                  <h2 className="font-headline-sm font-bold text-slate-900">{active.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleDone(active.id)}
                  aria-pressed={!!done[active.id]}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
                    done[active.id]
                      ? "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{done[active.id] ? "check_circle" : "task_alt"}</span>
                  {done[active.id] ? "Selesai — batalkan?" : "Tandai Selesai"}
                </button>
              </div>
            </>
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-center p-6">
              <span className="material-symbols-outlined text-5xl text-slate-300">movie</span>
              <p className="text-sm font-semibold text-slate-600">Belum ada video di kursus ini</p>
              {isAuthor && <p className="text-xs text-slate-400">Tambahkan video pertama lewat panel di bawah.</p>}
            </div>
          )}

          {/* Terjemahan AI (penulis kursus) */}
          {active && isAuthor && (active.subtitleDriveFileId || active.subtitleUrl) && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-500">translate</span>
              {aiReady() ? (
                <button
                  type="button"
                  onClick={() => void runTranslate()}
                  disabled={translating}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 disabled:opacity-60 transition-colors"
                >
                  {translating ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Menerjemahkan… {transProg.done}/{transProg.total || "?"} batch
                    </>
                  ) : (
                    <>{active.subtitleTranslated ? "Perbarui Terjemahan AI" : "Terjemahkan Subtitle (AI)"}</>
                  )}
                </button>
              ) : (
                <span className="text-xs text-slate-500">Konfigurasi AI belum diisi — terjemahan otomatis nonaktif.</span>
              )}
              {active.subtitleTranslated && !translating && (
                <span className="text-[11px] font-semibold text-emerald-600">
                  Terjemahan siap — penonton bisa pilih &ldquo;ID&rdquo; di bawah video.
                </span>
              )}
              {transError && <span className="text-xs font-semibold text-rose-600">{transError}</span>}
            </div>
          )}
        </div>

        {/* Playlist */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-label-ui text-xs font-bold text-slate-900 uppercase tracking-wide px-1 mb-2">
            Daftar Video ({courseLessons.length})
          </p>
          {groups ? (
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
              {groups.map((g) => {
                const open = openSections[g.name] !== false;
                return (
                  <div key={g.name}>
                    <button
                      type="button"
                      onClick={() => setOpenSections((s) => ({ ...s, [g.name]: !open }))}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                    >
                      <span className="text-[11px] font-bold text-slate-700 truncate">{g.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">
                        {open ? "▾" : "▸"} {g.items.length}
                      </span>
                    </button>
                    {open && <div className="flex flex-col gap-1 mt-1">{g.items.map(renderLesson)}</div>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-[420px] overflow-y-auto">{courseLessons.map(renderLesson)}</div>
          )}
          {courseLessons.length === 0 && (
            <p className="text-xs text-slate-400 px-1 py-4 text-center">Playlist masih kosong.</p>
          )}

          {/* Materi bacaan (PDF) */}
          {courseMaterials.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="font-label-ui text-xs font-bold text-slate-900 uppercase tracking-wide px-1 mb-2">
                Materi Bacaan ({courseMaterials.length})
              </p>
              <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                {courseMaterials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPdf({ id: m.driveFileId, title: m.title })}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-transparent hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-rose-500 shrink-0">picture_as_pdf</span>
                    <span className="min-w-0 flex-1 text-xs font-semibold text-slate-700 truncate">{m.title}</span>
                    <span className="text-[10px] font-bold text-indigo-600 shrink-0">Buka</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Viewer PDF */}
      {pdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={pdf.title}>
          <div className="absolute inset-0 bg-slate-950/70" onClick={() => setPdf(null)} />
          <div className="relative w-full max-w-4xl rounded-2xl bg-white overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[18px] text-rose-500 shrink-0">picture_as_pdf</span>
                <span className="truncate">{pdf.title}</span>
              </p>
              <a
                href={`https://drive.google.com/file/d/${pdf.id}/view`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 shrink-0"
              >
                Tab baru
              </a>
              <button
                type="button"
                onClick={() => setPdf(null)}
                aria-label="Tutup"
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <iframe
              src={`https://drive.google.com/file/d/${pdf.id}/preview`}
              className="w-full h-[70vh] bg-slate-100"
              title={pdf.title}
              allow="autoplay"
            />
          </div>
        </div>
      )}

      {/* Panel penulis */}
      {isAuthor && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-headline-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-indigo-500">video_settings</span>
            Kelola Materi
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Tempel <strong>link share Google Drive</strong> (klik kanan file → Bagikan → &ldquo;Siapa saja yang memiliki link&rdquo;).
            Subtitle opsional: file <code className="font-label-code">.srt</code> atau <code className="font-label-code">.vtt</code> dari Drive.
          </p>
          <form onSubmit={submitLesson} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div className="md:col-span-1 flex flex-col gap-2">
              <input
                value={lTitle}
                onChange={(e) => setLTitle(e.target.value)}
                placeholder="Judul video (cth. State & Hooks)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
              <input
                value={lSub}
                onChange={(e) => setLSub(e.target.value)}
                placeholder="Link subtitle Drive (.srt/.vtt) — opsional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <input
              value={lVideo}
              onChange={(e) => setLVideo(e.target.value)}
              placeholder="Link video: share Google Drive atau URL https://…mp4"
              className="md:col-span-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={adding}
              className="md:col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {adding ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">add</span>
              )}
              Tambah Video
            </button>
          </form>
          {lError && <p className="mt-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{lError}</p>}
          {delError && <p className="mt-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{delError}</p>}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">Menghapus kursus menghapus semua video di dalamnya.</p>
            {confirmCourse ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void removeCourse()}
                  className="text-xs font-bold text-white bg-rose-600 rounded-xl px-3.5 py-2 hover:bg-rose-700 transition-colors"
                >
                  Ya, hapus kursus
                </button>
                <button type="button" onClick={() => setConfirmCourse(false)} className="text-xs font-semibold text-slate-500 hover:underline">
                  Batal
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCourse(true)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Hapus kursus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

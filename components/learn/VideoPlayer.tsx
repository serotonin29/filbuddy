"use client";

// ============================================================
// VideoPlayer Kelas Belajar — <video> native + kontrol ringan:
// kecepatan, lompat ±5s, subtitle dari Google Drive, lanjut dari
// posisi terakhir (localStorage), dan deteksi gagal muat.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { videoSrcChain, useDriveSubtitle, useTextSubtitle } from "@/lib/drive";
import type { LearnLesson } from "@/lib/learnTypes";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2] as const;
const SPEED_LABEL: Record<number, string> = { 1: "1x", 1.25: "1.25x", 1.5: "1.5x", 1.75: "1.75x", 2: "2x" };

function posKey(lessonId: string) {
  return `filbuddy-learn-pos-${lessonId}`;
}

export function VideoPlayer({ lesson, onEnded }: { lesson: LearnLesson; onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const lastSaveRef = useRef(0);

  const [srcIdx, setSrcIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [subOn, setSubOn] = useState(true);
  /** Bahasa subtitle aktif: "asli" = file asli, "id" = hasil terjemahan AI */
  const [subLang, setSubLang] = useState<"asli" | "id">("id");

  const chain = useMemo(() => videoSrcChain(lesson), [lesson.id]);
  const src = chain[Math.min(srcIdx, chain.length - 1)];
  const origSub = useDriveSubtitle(lesson);
  const transSub = useTextSubtitle(lesson.subtitleTranslated ?? null);
  const hasTrans = !!lesson.subtitleTranslated;
  const activeSubUrl = subLang === "id" && hasTrans ? transSub : origSub.url;

  // Ganti pelajaran → reset state player
  useEffect(() => {
    setSrcIdx(0);
    setFailed(false);
    setSpeed(1);
    setSubLang("id");
    if (videoRef.current) videoRef.current.playbackRate = 1;
  }, [lesson.id]);

  // Terapkan kecepatan
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, lesson.id]);

  // Mode tampil subtitle
  useEffect(() => {
    const t = trackRef.current?.track;
    if (t) t.mode = subOn ? "showing" : "disabled";
  }, [subOn, activeSubUrl]);

  const onError = () => {
    if (srcIdx < chain.length - 1) {
      setSrcIdx((i) => i + 1);
      return;
    }
    setFailed(true);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 5000) return;
    lastSaveRef.current = now;
    try {
      localStorage.setItem(posKey(lesson.id), String(Math.floor(v.currentTime)));
    } catch {
      /* ignore */
    }
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const saved = parseFloat(localStorage.getItem(posKey(lesson.id)) ?? "0");
      if (saved > 3 && saved < (v.duration || Infinity) - 5) v.currentTime = saved;
    } catch {
      /* ignore */
    }
  };

  const onEndedAll = () => {
    try {
      localStorage.removeItem(posKey(lesson.id));
    } catch {
      /* ignore */
    }
    onEnded?.();
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min((v.duration || Infinity) - 0.1, v.currentTime + delta));
  };

  if (!src) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm text-slate-500">
        Video belum tersedia untuk pelajaran ini.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">
        <video
          ref={videoRef}
          key={src}
          className="w-full aspect-video"
          controls
          playsInline
          preload="metadata"
          src={src}
          onError={onError}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEndedAll}
        >
          {activeSubUrl && (
            <track
              ref={trackRef}
              kind="subtitles"
              srcLang={subLang === "id" && hasTrans ? "id" : "en"}
              label={subLang === "id" && hasTrans ? "Indonesia (AI)" : "Asli"}
              src={activeSubUrl}
              default={subOn}
            />
          )}
          Browser kamu tidak mendukung pemutaran video.
        </video>

        {failed && (
          <div className="absolute inset-0 bg-slate-900/95 text-slate-100 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-amber-400">video_library_off</span>
            <p className="font-headline-sm font-bold">Video gagal dimuat</p>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Pastikan file di Google Drive dibagikan ke <strong>&ldquo;Siapa saja yang memiliki link&rdquo;</strong> (Viewer),
              dan ukuran file tidak terlalu besar. Coba buka link file di browser untuk memastikan bisa diakses.
            </p>
          </div>
        )}
      </div>

      {/* Kontrol ringan */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => skip(-5)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">replay_5</span> -5s
        </button>
        <button
          type="button"
          onClick={() => skip(5)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">forward_5</span> +5s
        </button>
        <button
          type="button"
          onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s as 1) + 1) % SPEEDS.length])}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">speed</span> {SPEED_LABEL[speed] ?? "1x"}
        </button>
        {origSub.url && hasTrans && (
          <span className="inline-flex rounded-xl border border-slate-200 overflow-hidden" role="group" aria-label="Bahasa subtitle">
            {(["asli", "id"] as const).map((l) => {
              const isActive = subOn && subLang === l;
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setSubLang(l);
                    setSubOn(true);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-indigo-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] align-[-3px]">closed_caption</span>{" "}
                  {l === "id" ? "ID" : "Asli"}
                </button>
              );
            })}
          </span>
        )}
        {origSub.url && !hasTrans && (
          <button
            type="button"
            aria-pressed={subOn}
            onClick={() => setSubOn((on) => !on)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              subOn
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-500 hover:text-indigo-700"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">closed_caption</span>
            Subtitle {subOn ? "aktif" : "mati"}
          </button>
        )}
        {origSub.loading && <span className="text-xs text-slate-400">Memuat subtitle…</span>}
        {origSub.error && <span className="text-xs text-amber-600">{origSub.error}</span>}
      </div>
    </div>
  );
}

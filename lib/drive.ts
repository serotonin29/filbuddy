"use client";

// ============================================================
// Google Drive helpers untuk Kelas Belajar
// - parsing link share file/folder → id
// - resolusi URL streaming video (rantai fallback)
// - fetch subtitle (.srt/.vtt) → konversi VTT → Blob URL untuk <track>
// - membaca isi folder publik via Drive API v3 (API key, read-only)
// ============================================================

import { useEffect, useState } from "react";
import type { LearnLesson } from "./learnTypes";

/** API key Drive (client env). Kosong = fitur folder dimatikan. */
export function driveApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY ?? "";
}

/** Ambil file id dari link share Drive (…/file/d/ID/…, ?id=ID) atau id mentah. */
export function parseDriveId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m1 = s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return m2[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(s) && !s.startsWith("http")) return s;
  return null;
}

/** Ambil folder id dari link share folder (…/folders/ID) atau id mentah. */
export function parseFolderId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m1 = s.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return m1[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(s) && !s.startsWith("http")) return s;
  return null;
}

/**
 * URL streaming video dari Drive untuk <video src>.
 * Urutan fallback: googleapis (alt=media, butuh API key) → uc → usercontent.
 * File harus dibagikan "Siapa saja yang memiliki link".
 */
export function videoSrcChain(lesson: LearnLesson): string[] {
  if (lesson.driveFileId) {
    const out: string[] = [];
    const key = driveApiKey();
    if (key) out.push(`https://www.googleapis.com/drive/v3/files/${lesson.driveFileId}?alt=media&key=${key}`);
    out.push(`https://drive.google.com/uc?export=download&id=${lesson.driveFileId}`);
    out.push(`https://drive.usercontent.google.com/download?id=${lesson.driveFileId}&export=download&confirm=t`);
    return out;
  }
  return lesson.videoUrl ? [lesson.videoUrl] : [];
}

function srtToVtt(raw: string): string {
  const body = raw
    .replace(/\r+/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  if (/^\s*WEBVTT/.test(body)) return body;
  return `WEBVTT\n\n${body}`;
}

async function fetchTextChain(urls: string[]): Promise<string> {
  let lastErr: unknown = null;
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (r.ok) return await r.text();
      lastErr = new Error(`HTTP ${r.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("gagal mengambil file");
}

/**
 * Hook: siapkan URL subtitle untuk <track src>.
 * - subtitleDriveFileId → fetch teks dari Drive, konversi SRT→VTT, Blob URL
 * - subtitleUrl → dipakai langsung (harus .vtt dengan CORS terbuka)
 */
export function useDriveSubtitle(
  lesson: Pick<LearnLesson, "subtitleDriveFileId" | "subtitleUrl"> | null | undefined
): { url: string | null; loading: boolean; error: string | null } {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = lesson ? `${lesson.subtitleDriveFileId ?? ""}|${lesson.subtitleUrl ?? ""}` : "";

  useEffect(() => {
    if (!lesson) return;
    let revoked: string | null = null;
    let cancelled = false;

    if (lesson.subtitleDriveFileId) {
      setLoading(true);
      setError(null);
      setUrl(null);
      const urls: string[] = [];
      const apiKey = driveApiKey();
      if (apiKey) urls.push(`https://www.googleapis.com/drive/v3/files/${lesson.subtitleDriveFileId}?alt=media&key=${apiKey}`);
      urls.push(`https://drive.google.com/uc?export=download&id=${lesson.subtitleDriveFileId}`);
      fetchTextChain(urls)
        .then((text) => {
          if (cancelled) return;
          const vtt = srtToVtt(text);
          const blob = new Blob([vtt], { type: "text/vtt" });
          revoked = URL.createObjectURL(blob);
          setUrl(revoked);
        })
        .catch(() => {
          if (!cancelled) setError("Subtitle gagal dimuat dari Drive.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (lesson.subtitleUrl) {
      setError(null);
      setUrl(lesson.subtitleUrl);
    } else {
      setUrl(null);
      setError(null);
    }

    return () => {
      cancelled = true;
      if (revoked && revoked.startsWith("blob:")) URL.revokeObjectURL(revoked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { url, loading, error };
}

// ============================================================
// Membaca isi folder publik via Drive API v3 (API key, read-only)
// ============================================================

export type DriveFile = { id: string; name: string; mimeType: string; size?: string };

export type DriveVideo = { title: string; videoId: string; subtitleId?: string; section?: string };
export type DriveMaterial = { title: string; fileId: string; section?: string };

export type DriveCourseTree = {
  name: string;
  folderId: string;
  videos: DriveVideo[];
  materials: DriveMaterial[];
};

const FOLDER_MIME = "application/vnd.google-apps.folder";
const VIDEO_EXTS = ["mp4", "webm", "mkv", "mov", "m4v", "avi"];
const SUB_EXTS = ["vtt", "srt"];

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return (i === -1 ? name : name.slice(0, i)).trim();
}

export function isVideoFile(f: DriveFile): boolean {
  return f.mimeType.startsWith("video/") || VIDEO_EXTS.includes(extOf(f.name));
}

function isSubtitleFile(f: DriveFile): boolean {
  return SUB_EXTS.includes(extOf(f.name));
}

function isPdfFile(f: DriveFile): boolean {
  return f.mimeType === "application/pdf" || extOf(f.name) === "pdf";
}

/** Pair video ↔ subtitle berdasarkan nama file yang sama (tanpa ekstensi). */
export function pairFolderFiles(files: DriveFile[]): { name: string; title: string; videoId: string; subtitleId?: string }[] {
  const videos = files.filter(isVideoFile).sort((a, b) => a.name.localeCompare(b.name, "id", { numeric: true }));
  const subs = files.filter(isSubtitleFile);
  return videos.map((v) => {
    const base = baseName(v.name).toLowerCase();
    const sub = subs.find((s) => baseName(s.name).toLowerCase() === base);
    return { name: v.name, title: baseName(v.name), videoId: v.id, subtitleId: sub?.id };
  });
}

async function describeDriveError(res: Response): Promise<string> {
  if (res.status === 403) return "API key ditolak (403) — pastikan Google Drive API sudah diaktifkan dan API key valid.";
  if (res.status === 404) return "Folder tidak ditemukan (404) — pastikan folder dibagikan ke \"Siapa saja yang memiliki link\".";
  if (res.status === 400) return "Permintaan ditolak (400) — cek API key atau link folder.";
  return `Drive API error (HTTP ${res.status}).`;
}

/** List anak-anak sebuah folder (file + subfolder). */
export async function listDriveChildren(folderId: string, apiKey: string): Promise<DriveFile[]> {
  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${encodeURIComponent(`'${folderId}' in parents and trashed = false`)}` +
    `&pageSize=200&orderBy=name_natural` +
    `&fields=${encodeURIComponent("nextPageToken, files(id,name,mimeType,size)")}` +
    `&key=${apiKey}&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await describeDriveError(res));
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

/**
 * Telusuri folder publik → pohon kursus (struktur ala Udemy):
 * - Folder level-1 di bawah root = SATU KURSUS (judul = nama foldernya)
 * - Subfolder di dalamnya = SECTION (nama bab), termasuk bertingkat ("A › B")
 * - Video langsung di root = satu kursus dengan nama folder root
 * - File PDF di mana pun dikumpulkan sebagai materi kursus terkait
 * Batas aman: kedalaman 4 dari root, maksimal 100 folder.
 */
export async function walkDriveFolder(
  rootFolderId: string,
  apiKey: string,
  opts?: { maxDepth?: number; maxFolders?: number }
): Promise<DriveCourseTree[]> {
  const maxDepth = opts?.maxDepth ?? 4;
  const maxFolders = opts?.maxFolders ?? 100;
  let budget = maxFolders;

  const courses: DriveCourseTree[] = [];

  /** Kumpulkan video+pdf rekursif di dalam satu kursus; label section dari path subfolder. */
  async function collect(
    folderId: string,
    section: string,
    depth: number,
    out: { videos: DriveVideo[]; materials: DriveMaterial[] }
  ): Promise<void> {
    if (budget <= 0) return;
    budget -= 1;
    const files = await listDriveChildren(folderId, apiKey);
    for (const p of pairFolderFiles(files)) {
      out.videos.push({ title: p.title, videoId: p.videoId, subtitleId: p.subtitleId, section: section || undefined });
    }
    for (const f of files.filter(isPdfFile)) {
      out.materials.push({ title: baseName(f.name), fileId: f.id, section: section || undefined });
    }
    if (depth < maxDepth) {
      for (const sf of files.filter((f) => f.mimeType === FOLDER_MIME)) {
        await collect(sf.id, section ? `${section} › ${sf.name}` : sf.name, depth + 1, out);
      }
    }
  }

  // Nama folder root untuk kursus video yang langsung di root
  let rootName = "Materi Utama";
  try {
    const r = await fetch(`https://www.googleapis.com/drive/v3/files/${rootFolderId}?fields=name&key=${apiKey}&supportsAllDrives=true`);
    if (r.ok) {
      const d = (await r.json()) as { name?: string };
      if (d.name) rootName = d.name;
    }
  } catch {
    /* fallback nama generik */
  }

  const rootFiles = await listDriveChildren(rootFolderId, apiKey);
  budget -= 1;

  const rootOut: { videos: DriveVideo[]; materials: DriveMaterial[] } = { videos: [], materials: [] };
  for (const p of pairFolderFiles(rootFiles)) {
    rootOut.videos.push({ title: p.title, videoId: p.videoId, subtitleId: p.subtitleId });
  }
  for (const f of rootFiles.filter(isPdfFile)) {
    rootOut.materials.push({ title: baseName(f.name), fileId: f.id });
  }
  if (rootOut.videos.length > 0) {
    courses.push({ name: rootName, folderId: rootFolderId, videos: rootOut.videos, materials: rootOut.materials });
  }

  for (const sf of rootFiles.filter((f) => f.mimeType === FOLDER_MIME)) {
    const out: { videos: DriveVideo[]; materials: DriveMaterial[] } = { videos: [], materials: [] };
    await collect(sf.id, "", 1, out);
    if (out.videos.length > 0) {
      courses.push({ name: sf.name, folderId: sf.id, videos: out.videos, materials: out.materials });
    }
  }

  return courses;
}

/**
 * Ambil TEKS subtitle mentah (SRT/VTT) — dipakai fitur terjemahan AI.
 * Rantai sumber sama dengan pemutar video: googleapis → uc.
 */
export async function fetchSubtitleText(
  sub: { subtitleDriveFileId?: string; subtitleUrl?: string } | null | undefined
): Promise<string> {
  if (!sub) throw new Error("Pelajaran tidak memiliki subtitle.");
  if (sub.subtitleDriveFileId) {
    const urls: string[] = [];
    const apiKey = driveApiKey();
    if (apiKey) urls.push(`https://www.googleapis.com/drive/v3/files/${sub.subtitleDriveFileId}?alt=media&key=${apiKey}`);
    urls.push(`https://drive.google.com/uc?export=download&id=${sub.subtitleDriveFileId}`);
    return fetchTextChain(urls);
  }
  if (sub.subtitleUrl) return fetchTextChain([sub.subtitleUrl]);
  throw new Error("Pelajaran tidak memiliki subtitle.");
}

/** Hook: teks VTT (mis. hasil terjemahan) → Blob URL untuk <track src>. */
export function useTextSubtitle(text: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!text) {
      setUrl(null);
      return;
    }
    const blob = new Blob([/^\s*WEBVTT/.test(text) ? text : `WEBVTT\n\n${text}`], { type: "text/vtt" });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [text]);
  return url;
}

// ============================================================
// Parsing subtitle untuk terjemahan AI
// ============================================================

export type ParsedCue = { i: number; start: string; end: string; text: string };

/** Pecah SRT/VTT → daftar cue bernomor (timestamp dipertahankan). */
export function parseSubtitleCues(raw: string): ParsedCue[] {
  const body = raw
    .replace(/\r+/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  const cues: ParsedCue[] = [];
  for (const block of body.split(/\n{2,}/)) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    let li = 0;
    if (/^\d+$/.test(lines[0].trim()) && lines.length > 1) li = 1;
    const tm = lines[li]?.match(/(\d{1,2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3})/);
    if (!tm) continue;
    const text = lines.slice(li + 1).join(" ").trim();
    if (text) cues.push({ i: cues.length, start: tm[1].replace(",", "."), end: tm[2].replace(",", "."), text });
  }
  return cues;
}

/** Susun kembali cue → teks VTT utuh, memakai terjemahan bila tersedia. */
export function buildVtt(cues: ParsedCue[], translations?: Map<number, string>): string {
  const lines: string[] = ["WEBVTT", ""];
  cues.forEach((c, idx) => {
    lines.push(String(idx + 1));
    lines.push(`${c.start} --> ${c.end}`);
    lines.push(translations?.get(c.i) || c.text);
    lines.push("");
  });
  return lines.join("\n");
}

/** Contoh video publik untuk seed mode demo (bukan Drive, langsung mp4). */
export const DEMO_SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

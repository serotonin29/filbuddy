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

export type DriveCourseTree = {
  name: string;
  folderId: string;
  videos: { title: string; videoId: string; subtitleId?: string }[];
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
 * Telusuri folder publik → pohon kursus.
 * - Subfolder menjadi "kursus" (judul = nama subfolder)
 * - Video langsung di root menjadi satu kursus "Materi Utama"
 * Batas aman: kedalaman 3, maksimal 60 folder.
 */
export async function walkDriveFolder(
  rootFolderId: string,
  apiKey: string,
  opts?: { maxDepth?: number; maxFolders?: number }
): Promise<DriveCourseTree[]> {
  const maxDepth = opts?.maxDepth ?? 3;
  const maxFolders = opts?.maxFolders ?? 100;
  let budget = maxFolders;

  const courses: DriveCourseTree[] = [];

  async function walk(folderId: string, name: string, depth: number): Promise<void> {
    if (budget <= 0) return;
    budget -= 1;
    const files = await listDriveChildren(folderId, apiKey);
    const paired = pairFolderFiles(files);
    if (paired.length > 0) {
      courses.push({ name, folderId, videos: paired.map((p) => ({ title: p.title, videoId: p.videoId, subtitleId: p.subtitleId })) });
    }
    if (depth < maxDepth) {
      for (const sf of files.filter((f) => f.mimeType === FOLDER_MIME)) {
        await walk(sf.id, sf.name, depth + 1);
      }
    }
  }

  // Nama folder root untuk grup video yang langsung di root
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
  const rootVideos = pairFolderFiles(rootFiles);
  if (rootVideos.length > 0) {
    courses.push({ name: rootName, folderId: rootFolderId, videos: rootVideos.map((p) => ({ title: p.title, videoId: p.videoId, subtitleId: p.subtitleId })) });
  }
  for (const sf of rootFiles.filter((f) => f.mimeType === FOLDER_MIME)) {
    await walk(sf.id, sf.name, 1);
  }

  return courses;
}

/** Contoh video publik untuk seed mode demo (bukan Drive, langsung mp4). */
export const DEMO_SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

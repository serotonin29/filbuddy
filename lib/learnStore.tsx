"use client";

// ============================================================
// FilBuddy Learn Store — kursus video (Google Drive) per domain,
// mengikuti pola communityStore: provider sendiri di atas useStore().
// Mode "supabase" → tabel learn_*; kalau tabel belum ada (SQL belum
// dijalankan) atau mode "demo" → localStorage + seed (fallback lokal).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase/client";
import { useStore } from "./store";
import {
  parseDriveId,
  driveApiKey,
  walkDriveFolder,
  fetchSubtitleText,
  parseSubtitleCues,
  buildVtt,
  type DriveCourseTree,
  DEMO_SAMPLE_VIDEO,
} from "./drive";
import { translateCues, aiReady } from "./ai";
import type { LearnActionResult, LearnCourse, LearnLesson, LearnMaterial } from "./learnTypes";

const LS_KEY = "filbuddy-learn-demo-v1";
const CACHE_KEY = "filbuddy-learn-cache-v1";

type LearnState = {
  courses: LearnCourse[];
  lessons: LearnLesson[];
  /** Materi PDF per kursus */
  materials: LearnMaterial[];
  /** lessonId → ISO waktu selesai */
  done: Record<string, string>;
  /** courseId → jumlah video (grid render instan tanpa menunggu daftar video) */
  counts: Record<string, number>;
};

type LessonInput = { title: string; video: string; subtitle?: string };

type LearnContextValue = LearnState & {
  ready: boolean;
  mode: "demo" | "supabase";
  createCourse: (c: { title: string; description: string; category: string }) => Promise<LearnActionResult>;
  addLesson: (courseId: string, l: LessonInput) => Promise<LearnActionResult>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<LearnActionResult>;
  deleteCourse: (courseId: string) => Promise<LearnActionResult>;
  toggleDone: (lessonId: string) => Promise<void>;
  /**
   * Import isi folder Google Drive — folder utama jadi kursus, subfolder
   * jadi section, video jadi pelajaran, PDF jadi materi, subtitle
   * .srt/.vtt dipasangkan otomatis. Import ulang folder yang sama
   * menggantikan hasil import sebelumnya.
   */
  syncFolder: (folderId: string) => Promise<LearnActionResult & { courses?: number; lessons?: number; materials?: number }>;
  /**
   * Terjemahkan subtitle pelajaran ke Bahasa Indonesia via AI lalu simpan
   * (hanya penulis kursus). onProgress(done, total) = progres batch.
   */
  translateSubtitle: (
    lessonId: string,
    onProgress?: (done: number, total: number) => void
  ) => Promise<LearnActionResult>;
};

const LearnContext = createContext<LearnContextValue | null>(null);

// ---- Seed mode demo (video publik Google sample bucket, bukan Drive) ----

function demoSeed(): LearnState {
  const t = "2026-01-15T08:00:00.000Z";
  const mk = (courseId: string, title: string, position: number, videoUrl: string): LearnLesson => ({
    id: `${courseId}-l${position}`,
    courseId,
    title,
    position,
    videoUrl,
  });
  return {
    courses: [
      {
        id: "demo-course-react",
        title: "React Dasar untuk Pemula",
        description: "Kenali component, props, dan state lewat video singkat. Cocok untuk yang baru mulai Web Dev.",
        category: "Web Dev",
        authorId: "demo",
        authorName: "Dosen Pendamping",
        createdAt: t,
      },
      {
        id: "demo-course-sql",
        title: "SQL JOIN Tanpa Pusing",
        description: "Visualisasi INNER/LEFT JOIN dengan contoh kasus praktikum basis data.",
        category: "Database",
        authorId: "demo",
        authorName: "Dosen Pendamping",
        createdAt: t,
      },
    ],
    lessons: [
      mk("demo-course-react", "Apa itu React & cara setup", 1, DEMO_SAMPLE_VIDEO),
      mk("demo-course-react", "Component & Props", 2, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"),
      mk("demo-course-react", "State & Hooks pertamamu", 3, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"),
      mk("demo-course-sql", "Kenapa butuh JOIN?", 1, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"),
      mk("demo-course-sql", "LEFT JOIN vs INNER JOIN", 2, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"),
    ],
    done: {},
    counts: {},
    materials: [],
  };
}

function loadDemoState(): LearnState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearnState;
      if (Array.isArray(parsed.courses) && Array.isArray(parsed.lessons)) {
        return { courses: parsed.courses, lessons: parsed.lessons, done: parsed.done ?? {}, counts: {}, materials: [] };
      }
    }
  } catch {
    /* ignore */
  }
  const seeded = demoSeed();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Tebak kategori dari nama folder/subfolder. */
function guessCategory(name: string): string {
  const s = name.toLowerCase();
  if (/(web|react|html|css|javascript|frontend|next|laravel)/.test(s)) return "Web Dev";
  if (/(mobile|android|flutter|ios|kotlin|react native)/.test(s)) return "Mobile";
  if (/(ui|ux|design|figma|desain)/.test(s)) return "UI/UX";
  if (/(sql|database|basis data|dbms)/.test(s)) return "Database";
  if (/(jaringan|network|ccna|tcp)/.test(s)) return "Jaringan";
  if (/(algoritma|struktur data|algo)/.test(s)) return "Algoritma";
  return "Matkul Teori";
}

// ---- Penyimpanan sumber video dari input bebas user ----

function resolveLessonInput(input: { video: string; subtitle?: string }): {
  ok: boolean;
  error?: string;
  fields?: Pick<LearnLesson, "driveFileId" | "videoUrl" | "subtitleDriveFileId" | "subtitleUrl">;
} {
  const video = input.video.trim();
  const sub = (input.subtitle ?? "").trim();
  const subDrive = sub ? parseDriveId(sub) : null;
  const subUrl = sub && /^https:\/\//.test(sub) ? sub : undefined;
  if (sub && !subDrive && !subUrl) {
    return { ok: false, error: "Link subtitle harus link share Google Drive atau URL .vtt langsung." };
  }

  const driveId = parseDriveId(video);
  if (driveId) {
    return {
      ok: true,
      fields: {
        driveFileId: driveId,
        subtitleDriveFileId: subDrive ?? undefined,
        subtitleUrl: subDrive ? undefined : subUrl,
      },
    };
  }
  if (/^https?:\/\//.test(video)) {
    return {
      ok: true,
      fields: { videoUrl: video, subtitleDriveFileId: subDrive ?? undefined, subtitleUrl: subDrive ? undefined : subUrl },
    };
  }
  return { ok: false, error: "Video wajib diisi: tempel link share Google Drive atau URL video langsung (https://…)." };
}

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const user = store.user;

  /** true kalau tabel learn_* belum ada di Supabase → fallback lokal */
  const [dbMissing, setDbMissing] = useState(false);
  const [state, setState] = useState<LearnState>({ courses: [], lessons: [], done: {}, counts: {}, materials: [] });
  const [ready, setReady] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);

  // Mode efektif: supabase hanya kalau DB benar-benar tersedia.
  const effMode: "demo" | "supabase" = store.mode === "supabase" && !dbMissing ? "supabase" : "demo";
  const loadKey = `${effMode}:${user?.id ?? "anon"}`;

  // ---- Pemuatan data ----
  useEffect(() => {
    if (loadedKeyRef.current === loadKey) return;
    loadedKeyRef.current = loadKey;
    let cancelled = false;

    if (effMode === "demo") {
      setState(loadDemoState());
      setReady(true);
      return;
    }

    setReady(false);
    (async () => {
      // 1) Cache sesi → grid langsung tampil tanpa menunggu jaringan,
      //    data tetap disegarkan di langkah berikutnya.
      const cacheKey = `${CACHE_KEY}:${user!.id!}`;
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const c = JSON.parse(raw) as LearnState;
          if (Array.isArray(c.courses) && Array.isArray(c.lessons)) {
            setState({
              courses: c.courses,
              lessons: c.lessons,
              done: c.done ?? {},
              counts: c.counts ?? {},
              materials: Array.isArray(c.materials) ? c.materials : [],
            });
            setReady(true);
          }
        }
      } catch {
        /* ignore */
      }

      // 2) Query ringan: kursus + nama penulis + JUMLAH video (agregat embedded).
      //    Grid tidak perlu menunggu daftar 400-an video untuk render.
      let cRes = await supabase!
        .from("learn_courses")
        .select("*, profiles!learn_courses_author_id_fkey(name), lessons:learn_lessons(count)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      let cErr = cRes.error;
      if (cErr && !cErr.message.includes("does not exist") && !cErr.message.includes("schema cache") && cErr.code !== "PGRST205") {
        // Fallback: agregat count tidak didukung → ulangi tanpa count
        cRes = await supabase!
          .from("learn_courses")
          .select("*, profiles!learn_courses_author_id_fkey(name)")
          .order("created_at", { ascending: false });
        cErr = cRes.error;
        if (cancelled) return;
      }
      if (cErr && (cErr.code === "PGRST205" || cErr.message.includes("schema cache") || cErr.message.includes("does not exist"))) {
        console.warn("[FilBuddy] Tabel learn_* belum ada — jalankan supabase/learn_tables.sql. Kelas Belajar memakai mode lokal.");
        setDbMissing(true);
        return;
      }
      const courses: LearnCourse[] = ((cRes.data ?? []) as Array<{
        id: string; author_id: string; title: string; description: string; category: string; created_at: string;
        profiles: { name: string } | null; lessons?: Array<{ count?: number }>;
      }>).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        authorId: r.author_id,
        authorName: r.profiles?.name ?? "Mahasiswa",
        createdAt: r.created_at,
      }));
      const counts: Record<string, number> = {};
      for (const r of (cRes.data ?? []) as Array<{ id: string; lessons?: Array<{ count?: number }> }>) {
        counts[r.id] = Array.isArray(r.lessons) && r.lessons[0]?.count != null ? Number(r.lessons[0].count) : 0;
      }
      setState((s) => ({ ...s, courses }));
      setReady(true);

      // 3) Query berat di belakang: daftar video lengkap + materi PDF + progres pribadi
      const [lRes, mRes, pRes] = await Promise.all([
        supabase!.from("learn_lessons").select("*").order("position"),
        supabase!.from("learn_materials").select("*").order("position"),
        supabase!.from("learn_progress").select("lesson_id, completed_at").eq("user_id", user!.id!),
      ]);
      if (cancelled) return;
      const lessons: LearnLesson[] = ((lRes.data ?? []) as Array<{
        id: string; course_id: string; title: string; position: number;
        drive_file_id: string | null; video_url: string | null;
        subtitle_drive_file_id: string | null; subtitle_url: string | null;
        subtitle_translated: string | null; section: string | null;
      }>).map((r) => ({
        id: r.id,
        courseId: r.course_id,
        title: r.title,
        position: r.position,
        driveFileId: r.drive_file_id ?? undefined,
        videoUrl: r.video_url ?? undefined,
        subtitleDriveFileId: r.subtitle_drive_file_id ?? undefined,
        subtitleUrl: r.subtitle_url ?? undefined,
        subtitleTranslated: r.subtitle_translated ?? undefined,
        section: r.section ?? undefined,
      }));
      const materials: LearnMaterial[] = ((mRes.data ?? []) as Array<{
        id: string; course_id: string; title: string; drive_file_id: string;
        section: string | null; position: number;
      }>).map((r) => ({
        id: r.id,
        courseId: r.course_id,
        title: r.title,
        driveFileId: r.drive_file_id,
        section: r.section ?? undefined,
        position: r.position,
      }));
      const done: Record<string, string> = {};
      for (const p of (pRes.data ?? []) as Array<{ lesson_id: string; completed_at: string }>) {
        done[p.lesson_id] = p.completed_at;
      }
      setState((s) => ({ ...s, lessons, materials, done }));
    })();

    return () => {
      cancelled = true;
    };
  }, [loadKey, effMode]);

  // Tulis cache sesi setiap state berubah (kunjungan berikutnya = render instan)
  useEffect(() => {
    if (effMode !== "supabase" || !ready || !user?.id) return;
    try {
      sessionStorage.setItem(`${CACHE_KEY}:${user.id}`, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, effMode, ready, user?.id]);

  const persistDemo = useCallback((next: LearnState) => {
    setState(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  // ---- Aksi: kursus ----
  const createCourse = useCallback<LearnContextValue["createCourse"]>(
    async (c) => {
      const title = c.title.trim();
      if (title.length < 5) return { ok: false, error: "Judul kursus minimal 5 karakter." };
      if (effMode === "supabase") {
        const uidNow = user?.id;
        if (!uidNow || !supabase) return { ok: false, error: "Silakan masuk dulu." };
        const { data, error } = await supabase
          .from("learn_courses")
          .insert({ author_id: uidNow, title, description: c.description.trim(), category: c.category })
          .select("id")
          .single();
        if (error || !data) return { ok: false, error: "Gagal membuat kursus: " + error?.message };
        const id = (data as { id: string }).id;
        setState((s) => ({
          ...s,
          courses: [
            { id, title, description: c.description.trim(), category: c.category, authorId: uidNow, authorName: user?.name ?? "Kamu", createdAt: new Date().toISOString() },
            ...s.courses,
          ],
          counts: { ...s.counts, [id]: 0 },
        }));
        return { ok: true, id };
      }
      const id = uid();
      persistDemo({
        ...state,
        courses: [
          { id, title, description: c.description.trim(), category: c.category, authorId: "demo", authorName: user?.name ?? "Kamu", createdAt: new Date().toISOString() },
          ...state.courses,
        ],
      });
      return { ok: true, id };
    },
    [effMode, user, state, persistDemo]
  );

  const deleteCourse = useCallback<LearnContextValue["deleteCourse"]>(
    async (courseId) => {
      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return { ok: false, error: "Kursus tidak ditemukan." };
      if (effMode === "supabase") {
        const uidNow = user?.id;
        if (!uidNow || course.authorId !== uidNow) return { ok: false, error: "Bukan kursusmu." };
        const { error } = await supabase!.from("learn_courses").delete().eq("id", courseId);
        if (error) return { ok: false, error: "Gagal menghapus kursus." };
      }
      persistDemo({
        courses: state.courses.filter((c) => c.id !== courseId),
        lessons: state.lessons.filter((l) => l.courseId !== courseId),
        materials: state.materials.filter((m) => m.courseId !== courseId),
        done: Object.fromEntries(Object.entries(state.done).filter(([lid]) => !state.lessons.some((l) => l.id === lid && l.courseId === courseId))),
        counts: Object.fromEntries(Object.entries(state.counts).filter(([cid]) => cid !== courseId)),
      });
      return { ok: true };
    },
    [effMode, user, state, persistDemo]
  );

  // ---- Aksi: pelajaran ----
  const addLesson = useCallback<LearnContextValue["addLesson"]>(
    async (courseId, input) => {
      const title = input.title.trim();
      if (title.length < 3) return { ok: false, error: "Judul video minimal 3 karakter." };
      const resolved = resolveLessonInput(input);
      if (!resolved.ok || !resolved.fields) return { ok: false, error: resolved.error };
      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return { ok: false, error: "Kursus tidak ditemukan." };
      if (effMode === "supabase" && course.authorId !== user?.id) return { ok: false, error: "Bukan kursusmu." };

      const position = state.lessons.filter((l) => l.courseId === courseId).length + 1;
      const f = resolved.fields;

      if (effMode === "supabase") {
        const { data, error } = await supabase!
          .from("learn_lessons")
          .insert({
            course_id: courseId,
            title,
            drive_file_id: f.driveFileId ?? null,
            video_url: f.videoUrl ?? null,
            subtitle_drive_file_id: f.subtitleDriveFileId ?? null,
            subtitle_url: f.subtitleUrl ?? null,
            position,
          })
          .select("id")
          .single();
        if (error || !data) return { ok: false, error: "Gagal menambah video: " + error?.message };
        const id = (data as { id: string }).id;
        setState((s) => ({
          ...s,
          lessons: [...s.lessons, { id, courseId, title, position, ...f }],
          counts: { ...s.counts, [courseId]: (s.counts[courseId] ?? 0) + 1 },
        }));
        return { ok: true, id };
      }
      const id = uid();
      persistDemo({ ...state, lessons: [...state.lessons, { id, courseId, title, position, ...f }] });
      return { ok: true, id };
    },
    [effMode, user, state, persistDemo]
  );

  const deleteLesson = useCallback<LearnContextValue["deleteLesson"]>(
    async (courseId, lessonId) => {
      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return { ok: false, error: "Kursus tidak ditemukan." };
      if (effMode === "supabase" && course.authorId !== user?.id) return { ok: false, error: "Bukan kursusmu." };
      if (effMode === "supabase") {
        const { error } = await supabase!.from("learn_lessons").delete().eq("id", lessonId);
        if (error) return { ok: false, error: "Gagal menghapus video." };
      }
      persistDemo({
        courses: state.courses,
        lessons: state.lessons.filter((l) => l.id !== lessonId),
        materials: state.materials,
        done: Object.fromEntries(Object.entries(state.done).filter(([lid]) => lid !== lessonId)),
        counts: { ...state.counts, [courseId]: Math.max(0, (state.counts[courseId] ?? 1) - 1) },
      });
      return { ok: true };
    },
    [effMode, user, state, persistDemo]
  );

  // ---- Aksi: progres ----
  const toggleDone = useCallback<LearnContextValue["toggleDone"]>(
    async (lessonId) => {
      const isDone = !!state.done[lessonId];
      if (effMode === "supabase") {
        const uidNow = user?.id;
        if (!uidNow || !supabase) return;
        if (isDone) {
          await supabase.from("learn_progress").delete().match({ lesson_id: lessonId, user_id: uidNow });
        } else {
          await supabase.from("learn_progress").upsert({ lesson_id: lessonId, user_id: uidNow });
        }
      }
      persistDemo({
        ...state,
        done: isDone
          ? Object.fromEntries(Object.entries(state.done).filter(([lid]) => lid !== lessonId))
          : { ...state.done, [lessonId]: new Date().toISOString() },
      });
    },
    [effMode, user, state, persistDemo]
  );

  // ---- Aksi: import folder Google Drive ----
  const syncFolder = useCallback<LearnContextValue["syncFolder"]>(
    async (folderId) => {
      const apiKey = driveApiKey();
      if (!apiKey) return { ok: false, error: "NO_API_KEY" };
      let tree: DriveCourseTree[];
      try {
        tree = await walkDriveFolder(folderId, apiKey);
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
      const totalLessons = tree.reduce((n, c) => n + c.videos.length, 0);
      const totalMaterials = tree.reduce((n, c) => n + c.materials.length, 0);
      if (tree.length === 0 || totalLessons === 0) {
        return { ok: false, error: "Tidak ada file video ditemukan di folder itu." };
      }

      if (effMode === "supabase") {
        const uidNow = user?.id;
        if (!uidNow || !supabase) return { ok: false, error: "Silakan masuk dulu." };
        // Import ulang folder yang sama → hapus kursus lama (milik sendiri) dulu
        const { data: olds } = await supabase
          .from("learn_courses")
          .select("id")
          .eq("source_folder_id", folderId)
          .eq("author_id", uidNow);
        const oldIds = ((olds ?? []) as Array<{ id: string }>).map((r) => r.id);
        if (oldIds.length > 0) await supabase.from("learn_courses").delete().in("id", oldIds);

        const { data: inserted, error } = await supabase
          .from("learn_courses")
          .insert(
            tree.map((c) => ({
              author_id: uidNow,
              title: c.name.slice(0, 120),
              description: `${c.videos.length} video — diimport otomatis dari folder Google Drive.`,
              category: guessCategory(c.name),
              source_folder_id: folderId,
            }))
          )
          .select("id, title");
        if (error || !inserted) return { ok: false, error: "Gagal membuat kursus: " + error?.message };

        const rows = inserted as Array<{ id: string; title: string }>;
        const courseRows: LearnCourse[] = rows.map((r, i) => ({
          id: r.id,
          title: r.title,
          description: `${tree[i].videos.length} video — diimport otomatis dari folder Google Drive.`,
          category: guessCategory(tree[i].name),
          authorId: uidNow,
          authorName: user?.name ?? "Kamu",
          createdAt: new Date().toISOString(),
          sourceFolderId: folderId,
        }));

        const lessonInserts: Array<{
          course_id: string; title: string; drive_file_id: string; subtitle_drive_file_id: string | null; section: string | null; position: number;
        }> = [];
        rows.forEach((r, i) => {
          tree[i].videos.forEach((v, j) => {
            lessonInserts.push({
              course_id: r.id,
              title: v.title,
              drive_file_id: v.videoId,
              subtitle_drive_file_id: v.subtitleId ?? null,
              section: v.section ?? null,
              position: j + 1,
            });
          });
        });
        let lessonRowsOut: LearnLesson[] = [];
        if (lessonInserts.length > 0) {
          const { data: li, error: lerr } = await supabase
            .from("learn_lessons")
            .insert(lessonInserts)
            .select("id, course_id, title, position, drive_file_id, subtitle_drive_file_id, section");
          if (lerr) return { ok: false, error: "Kursus dibuat, tapi gagal menambah video: " + lerr.message };
          lessonRowsOut = ((li ?? []) as Array<{
            id: string; course_id: string; title: string; position: number;
            drive_file_id: string | null; subtitle_drive_file_id: string | null; section: string | null;
          }>).map((r) => ({
            id: r.id,
            courseId: r.course_id,
            title: r.title,
            position: r.position,
            driveFileId: r.drive_file_id ?? undefined,
            subtitleDriveFileId: r.subtitle_drive_file_id ?? undefined,
            section: r.section ?? undefined,
          }));
        }

        const materialInserts: Array<{
          course_id: string; title: string; drive_file_id: string; section: string | null; position: number;
        }> = [];
        rows.forEach((r, i) => {
          tree[i].materials.forEach((m, j) => {
            materialInserts.push({
              course_id: r.id,
              title: m.title,
              drive_file_id: m.fileId,
              section: m.section ?? null,
              position: j + 1,
            });
          });
        });
        let materialRowsOut: LearnMaterial[] = [];
        if (materialInserts.length > 0) {
          const { data: mi, error: merr } = await supabase
            .from("learn_materials")
            .insert(materialInserts)
            .select("id, course_id, title, drive_file_id, section, position");
          if (merr) {
            // Materi gagal disimpan tidak membatalkan kursus/video yang sudah masuk
            console.warn("[FilBuddy] Gagal menyimpan materi PDF:", merr.message);
          } else {
            materialRowsOut = ((mi ?? []) as Array<{
              id: string; course_id: string; title: string; drive_file_id: string;
              section: string | null; position: number;
            }>).map((r) => ({
              id: r.id,
              courseId: r.course_id,
              title: r.title,
              driveFileId: r.drive_file_id,
              section: r.section ?? undefined,
              position: r.position,
            }));
          }
        }

        const newCounts: Record<string, number> = {};
        rows.forEach((r, i) => {
          newCounts[r.id] = tree[i].videos.length;
        });
        setState((s) => ({
          courses: [...courseRows, ...s.courses.filter((c) => !oldIds.includes(c.id))],
          lessons: [...lessonRowsOut, ...s.lessons.filter((l) => !oldIds.includes(l.courseId))],
          materials: [...materialRowsOut, ...s.materials.filter((m) => !oldIds.includes(m.courseId))],
          done: s.done,
          counts: {
            ...Object.fromEntries(Object.entries(s.counts).filter(([cid]) => !oldIds.includes(cid))),
            ...newCounts,
          },
        }));
        return { ok: true, courses: tree.length, lessons: totalLessons, materials: materialRowsOut.length };
      }

      // Mode lokal (demo / fallback)
      const removedIds = state.courses.filter((c) => c.sourceFolderId === folderId).map((c) => c.id);
      const newCourses: LearnCourse[] = tree.map((c) => ({
        id: uid(),
        title: c.name.slice(0, 120),
        description: `${c.videos.length} video — diimport otomatis dari folder Google Drive.`,
        category: guessCategory(c.name),
        authorId: "demo",
        authorName: user?.name ?? "Kamu",
        createdAt: new Date().toISOString(),
        sourceFolderId: folderId,
      }));
      const newLessons: LearnLesson[] = tree.flatMap((c, i) =>
        c.videos.map((v, j) => ({
          id: uid(),
          courseId: newCourses[i].id,
          title: v.title,
          position: j + 1,
          driveFileId: v.videoId,
          subtitleDriveFileId: v.subtitleId,
          section: v.section,
        }))
      );
      const newMaterials: LearnMaterial[] = tree.flatMap((c, i) =>
        c.materials.map((m, j) => ({
          id: uid(),
          courseId: newCourses[i].id,
          title: m.title,
          driveFileId: m.fileId,
          section: m.section,
          position: j + 1,
        }))
      );
      persistDemo({
        courses: [...newCourses, ...state.courses.filter((c) => !removedIds.includes(c.id))],
        lessons: [...newLessons, ...state.lessons.filter((l) => !removedIds.includes(l.courseId))],
        materials: [...newMaterials, ...state.materials.filter((m) => !removedIds.includes(m.courseId))],
        done: state.done,
        counts: {
          ...Object.fromEntries(Object.entries(state.counts).filter(([cid]) => !removedIds.includes(cid))),
          ...Object.fromEntries(newCourses.map((c, i) => [c.id, tree[i].videos.length])),
        },
      });
      return { ok: true, courses: tree.length, lessons: totalLessons, materials: newMaterials.length };
    },
    [effMode, user, state, persistDemo]
  );

  // ---- Aksi: terjemahan subtitle via AI ----
  const translateSubtitle = useCallback<LearnContextValue["translateSubtitle"]>(
    async (lessonId, onProgress) => {
      if (effMode !== "supabase") return { ok: false, error: "Terjemahan AI hanya tersedia saat database aktif." };
      if (!aiReady()) return { ok: false, error: "NO_AI_CONFIG" };
      const lesson = state.lessons.find((l) => l.id === lessonId);
      if (!lesson) return { ok: false, error: "Pelajaran tidak ditemukan." };
      const course = state.courses.find((c) => c.id === lesson.courseId);
      if (!course) return { ok: false, error: "Kursus tidak ditemukan." };
      if (course.authorId !== user?.id) return { ok: false, error: "Hanya penulis kursus yang bisa menerjemahkan." };
      if (!lesson.subtitleDriveFileId && !lesson.subtitleUrl) {
        return { ok: false, error: "Pelajaran ini belum punya subtitle." };
      }
      let raw = "";
      try {
        raw = await fetchSubtitleText(lesson);
      } catch (e) {
        return { ok: false, error: "Gagal mengambil subtitle: " + (e as Error).message };
      }
      const cues = parseSubtitleCues(raw);
      if (cues.length === 0) return { ok: false, error: "Subtitle tidak bisa dibaca (format tidak dikenali)." };
      const map = await translateCues(cues, onProgress);
      const vtt = buildVtt(cues, map);
      const { error } = await supabase!.from("learn_lessons").update({ subtitle_translated: vtt }).eq("id", lessonId);
      if (error) return { ok: false, error: "Gagal menyimpan terjemahan: " + error.message };
      setState((s) => ({
        ...s,
        lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, subtitleTranslated: vtt } : l)),
      }));
      return { ok: true };
    },
    [effMode, user, state]
  );

  const value = useMemo<LearnContextValue>(
    () => ({
      ...state,
      ready: ready && store.ready,
      mode: effMode,
      createCourse,
      addLesson,
      deleteLesson,
      deleteCourse,
      toggleDone,
      syncFolder,
      translateSubtitle,
    }),
    [state, ready, store.ready, effMode, createCourse, addLesson, deleteLesson, deleteCourse, toggleDone, syncFolder, translateSubtitle]
  );

  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

export function useLearn(): LearnContextValue {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error("useLearn must be used within LearnProvider");
  return ctx;
}

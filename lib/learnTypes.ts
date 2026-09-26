// ============================================================
// Tipe fitur Kelas Belajar — video + subtitle dari Google Drive
// ============================================================

export type LearnCourse = {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  /** Diisi bila kursus diimport dari folder Google Drive */
  sourceFolderId?: string;
};

export type LearnLesson = {
  id: string;
  courseId: string;
  title: string;
  position: number;
  /** Google Drive file id (cara utama) */
  driveFileId?: string;
  /** URL video langsung (alternatif: mp4/webm publik) */
  videoUrl?: string;
  /** Google Drive file id subtitle (.srt/.vtt) */
  subtitleDriveFileId?: string;
  /** URL subtitle .vtt langsung */
  subtitleUrl?: string;
  /** Teks VTT hasil terjemahan AI (oleh penulis kursus) */
  subtitleTranslated?: string;
  /** Nama section/bab asal video (hasil import folder) */
  section?: string;
};

/** Materi bacaan PDF pada kursus (hasil import folder Drive) */
export type LearnMaterial = {
  id: string;
  courseId: string;
  title: string;
  driveFileId: string;
  section?: string;
  position: number;
};

export type LearnActionResult = { ok: boolean; error?: string; id?: string };

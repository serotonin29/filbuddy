import type { LearnSkill, TeachSkill } from "@/components/register/types";

export type { LearnSkill, TeachSkill };

export type StudyMode = "online" | "offline" | "hybrid";

export type User = {
  /** auth uid — hanya terisi di mode database */
  id?: string;
  name: string;
  nim: string;
  email: string;
  prodi: string;
  password: string;
  points: number;
  teachingHours: number;
  sessionsDone: number;
  rating: number;
  ratingCount: number;
  teachSkills: TeachSkill[];
  learnSkills: LearnSkill[];
  studyMode: StudyMode;
  availability: string[];
};

export type Answer = {
  id: number;
  author: string;
  nim: string;
  time: string;
  content: string;
  votes: number;
  accepted: boolean;
  authorId?: string;
};

export type QuestionStatus = "terjawab" | "menunggu" | "hot";

export type Question = {
  id: number;
  author: string;
  nim: string;
  time: string;
  status: QuestionStatus;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  views: string;
  reward?: number;
  votes: number;
  answers: Answer[];
  mine?: boolean;
};

export type SlotStatus = "live" | "scheduled" | "waiting";

export type Slot = {
  id: number;
  status: SlotStatus;
  note: string;
  title: string;
  schedule: string;
  partnerLabel: string;
  partner: string;
};

export type Activity = {
  id: number;
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
  time: string;
};

export const CATEGORIES = [
  "Semua",
  "Web Dev",
  "Mobile",
  "UI/UX",
  "Database",
  "Jaringan",
  "Matkul Teori",
  "Algoritma",
] as const;

export type ActionResult = { ok: boolean; error?: string };
type MaybeAsync<T> = T | Promise<T>;

export type Store = {
  ready: boolean;
  /** "demo" = localStorage, "supabase" = database online */
  mode: "demo" | "supabase";
  /** true kalau Supabase terkonfigurasi tapi schema belum tersedia (fallback demo) */
  degraded: boolean;
  user: User | null;
  questions: Question[];
  slots: Slot[];
  activities: Activity[];
  myVotes: Record<number, 1 | -1 | 0>;
  login: (identifier: string, password: string) => MaybeAsync<ActionResult>;
  register: (
    u: Omit<User, "points" | "teachingHours" | "sessionsDone" | "rating" | "ratingCount">
  ) => MaybeAsync<ActionResult>;
  logout: () => void | Promise<void>;
  createQuestion: (q: {
    title: string;
    excerpt: string;
    category: string;
    tags: string[];
    reward: number;
  }) => MaybeAsync<ActionResult>;
  voteQuestion: (id: number, dir: 1 | -1) => void | Promise<void>;
  addAnswer: (qid: number, content: string) => void | Promise<void>;
  acceptAnswer: (qid: number, aid: number) => void | Promise<void>;
  /** Edit isi jawaban milik sendiri */
  updateAnswer: (qid: number, aid: number, content: string) => MaybeAsync<ActionResult>;
  /** Hapus jawaban milik sendiri (ditolak bila sudah jadi jawaban terbaik) */
  deleteAnswer: (qid: number, aid: number) => MaybeAsync<ActionResult>;
  /** Hapus pertanyaan milik sendiri; reward dikembalikan bila belum terjawab */
  deleteQuestion: (qid: number) => MaybeAsync<ActionResult>;
  createSlot: (s: { title: string; schedule: string; partner: string; mode: string }) => void | Promise<void>;
  cancelSlot: (id: number) => void | Promise<void>;
  requestBarter: (name: string, teach: string, need: string) => void | Promise<void>;
  joinSession: (id: number) => void | Promise<void>;
};

export function levelOf(points: number) {
  if (points >= 500) return { level: 3, label: "Expert", next: 1200, floor: 500 };
  if (points >= 100) return { level: 2, label: "Buddy", next: 500, floor: 100 };
  return { level: 1, label: "Pemula", next: 100, floor: 0 };
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

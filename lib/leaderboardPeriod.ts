import { supabase } from "@/lib/supabase/client";

// ============================================================
// Leaderboard berbasis data nyata.
// Skor kontribusi dihitung dari tabel questions & answers
// dalam periode terpilih — bukan angka statis:
//   +5  Pts per pertanyaan baru
//   +10 Pts per jawaban
//   +25 Pts per jawaban terbaik (accepted)
// ============================================================

export type Period = "7h" | "30h" | "semester";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "7h", label: "7 Hari" },
  { id: "30h", label: "30 Hari" },
  { id: "semester", label: "Semester Ini" },
];

export const SCORE_RULE =
  "+5 Pts/pertanyaan · +10 Pts/jawaban · +25 Pts/jawaban terbaik";

export function sinceISO(period: Period): string {
  const now = new Date();
  if (period === "7h") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (period === "30h") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  // Semester genap dimulai 1 Agustus.
  const y = now.getFullYear();
  const start = now.getMonth() >= 7 ? new Date(y, 7, 1) : new Date(y - 1, 7, 1);
  return start.toISOString();
}

export type PeriodRow = {
  id: string;
  name: string;
  prodi: string;
  pts: number;
  questions: number;
  answers: number;
  best: number;
  me: boolean;
};

export async function fetchPeriodLeaderboard(
  period: Period,
  myId: string | null
): Promise<PeriodRow[]> {
  if (!supabase) return [];
  const since = sinceISO(period);
  const [qRes, aRes, pRes] = await Promise.all([
    supabase
      .from("questions")
      .select("author_id")
      .gte("created_at", since),
    supabase
      .from("answers")
      .select("author_id, accepted")
      .gte("created_at", since),
    supabase.from("profiles").select("id, name, prodi"),
  ]);
  if (qRes.error || aRes.error || pRes.error) {
    throw new Error(
      qRes.error?.message ?? aRes.error?.message ?? pRes.error?.message ?? "Gagal memuat leaderboard"
    );
  }

  const agg = new Map<string, PeriodRow>();
  for (const p of pRes.data ?? []) {
    const row = p as { id: string; name: string; prodi: string };
    agg.set(row.id, {
      id: row.id,
      name: row.name,
      prodi: row.prodi,
      pts: 0,
      questions: 0,
      answers: 0,
      best: 0,
      me: row.id === myId,
    });
  }
  for (const raw of qRes.data ?? []) {
    const row = raw as { author_id: string };
    const a = agg.get(row.author_id);
    if (a) {
      a.questions += 1;
      a.pts += 5;
    }
  }
  for (const raw of aRes.data ?? []) {
    const row = raw as { author_id: string; accepted: boolean };
    const a = agg.get(row.author_id);
    if (!a) continue;
    a.answers += 1;
    if (row.accepted) {
      a.best += 1;
      a.pts += 25;
    } else {
      a.pts += 10;
    }
  }

  return [...agg.values()]
    .filter((r) => r.pts > 0)
    .sort((x, y) => y.pts - x.pts || x.name.localeCompare(y.name));
}
